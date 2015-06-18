"use strict";

var twit = require('twit');
var _ = require('underscore');
var request = require('superagent');
var crypto = require('crypto');
var fs = require('fs');
var bignum = require('bignum');
var sleep = require('sleep');

function Checky(config) {
  this.config = config;

  // "since" functionality allows the bot to catch up on missed tweets since a given tweet.
  // The since file contains the id of the latest tweet to catch up from.
  // The since file is updated at each received tweet.
  // (Same for DMs: tweets and DMs share the same id sequence.)
  // If the since file is not there, the bot will catch up from the beginning.
  // You can pre-initialize the file using `echo -n 611293110774030336 > since`
  // where the bignum is the latest tweet to catch up from.
  if (!this.config.last_filepath) {
    this.config.since_filepath = './since';
  }
  this.since_id_str = '0';
  try {
    this.since_id_str = fs.readFileSync(this.config.since_filepath, { encoding: 'utf8' }) || '0';
  }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }

  // Connect to Twitter.
  if (!this.config.testing) { // TODO replace this with a mock twit object
    this.t = new twit(this.config.twitter);
    this.stream = this.t.stream('user', { with: 'user' });
    this.stream.on('tweet', this.processTweet.bind(this));
    this.stream.on('direct_message', this.processDirectMessage.bind(this));
    this.catchUp();
  }
}

Checky.prototype.processTweet = function(tweet) {
  console.log('received tweet ' + tweet.id_str);

  var self = this;
  this.updateSince(tweet);

  // Only process tweets that the bot did not send and where it is mentioned.
  if (tweet.user.screen_name === this.config.twitter.screen_name) {
    console.log('discarding ' + tweet.id_str + ' sent by bot');
    return;
  }
  if (!_.filter(tweet.entities.user_mentions, function(um) { return um.screen_name === self.config.twitter.screen_name }).length) {
    console.log('discarding ' + tweet.id_str + ' where bot is not mentioned');   
    return;
  }

  this.sendToWebhook(tweet);
}

Checky.prototype.processDirectMessage = function(dm) {
  console.log('received direct message ' + dm.direct_message.id_str);

  var tweet = dm.direct_message;
  tweet.user = tweet.sender;
  this.updateSince(tweet);

  // Only process messages that the bot did not send and where it is a recipient.
  if (tweet.sender_screen_name === this.config.twitter.screen_name) {
    console.log('discarding ' + dm.direct_message.id_str + ' sent by bot');
    return;
  }
  if (tweet.recipient_screen_name !== this.config.twitter.screen_name) {
    console.log('discarding ' + dm.direct_message.id_str + ' where bot is not a recipient');
    return;
  }

  this.sendToWebhook(tweet);
}

Checky.prototype.sendToWebhook = function(tweet) {
  console.log('sending ' + tweet.id_str + ' to webhook');

  var self = this;
  request
    .post(this.config.webhook.callback_url)
    .set('X-Checky-Signature', this.computeSignature(tweet))
    .auth(this.config.webhook.auth_username || '', this.config.webhook.auth_password || '')
    .send({ tweet: tweet })
    .end(function(err, res) {
      if (!err && res.body.reply) {
        self.tweetReply(res.body.reply, tweet);
      }
      else {
        console.log('received webhook error for ' + tweet.id_str);
        console.log(err);
      }
    });
}

Checky.prototype.computeSignature = function(tweet) {
  // @see https://developer.github.com/webhooks/securing/
  return 'sha1=' + crypto.createHmac('sha1', this.config.webhook.secret_token).update(JSON.stringify({ tweet: tweet }), 'utf8').digest('hex');
}

Checky.prototype.tweetReply = function(reply, tweet) {
  var self = this;
  // Either reply with a tweet or a direct message,
  // depending on source message.
  var reply_tweet;
  var reply_endpoint;
  var reply_type;
  if (typeof(tweet.sender) === 'undefined') {
    reply_tweet = {
      status: reply,
      in_reply_to_status_id: tweet.id_str
    };
    reply_endpoint = 'statuses/update';
    reply_type = 'tweet';
  }
  else {
    var reply_tweet = {
      text: reply,
      screen_name: tweet.sender_screen_name
    };
    reply_endpoint = 'direct_messages/new';
    reply_type = 'direct message';
  }
  console.log('replying to ' + tweet.id_str + ' with ' + reply_type);
  this.t.post(reply_endpoint, reply_tweet, function(err, data, res) {
    if (!err) {
      console.log('replied to ' + tweet.id_str + ' with ' + reply_type + ' ' + data.id_str);
    }
    else {
      console.log('received twitter error for ' + tweet.id_str);
      console.log(err);
    }
  });
}

Checky.prototype.updateSince = function(tweet) {
  // Remember this tweet's id if greater than current one.
  if (bignum(tweet.id_str).gt(this.since_id_str)) {
    fs.writeFileSync(this.config.since_filepath, tweet.id_str);
    this.since_id_str = tweet.id_str;
  }
}

Checky.prototype.catchUp = function() {
  console.log('catching up since ' + this.since_id_str);

  var self = this;
  var parameters = {
    count: 200,
    include_entities: true,
    since_id: this.since_id_str
  };
  if (bignum(this.since_id_str).eq('0')) {
    console.log('catching up from the top in 10 seconds...');
    sleep.sleep(10);
    delete parameters['since_id'];
  }
  this.t.get('statuses/mentions_timeline', parameters, function(err, data, response) {
    if (Array.isArray(data)) data.map(self.processTweet, self);
  });
  this.t.get('direct_messages', parameters, function(err, data, response) {
    if (Array.isArray(data)) data.map(function(dm) { self.processDirectMessage({ direct_message: dm }); }, self);
  });
}

module.exports = Checky;
