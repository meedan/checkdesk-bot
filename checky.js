"use strict";

var twit = require('twit');
var config = require('./config.js');
var _ = require('underscore');
var request = require('superagent');

function Checky(config) {
  this.config = config;
  this.t = new twit(this.config.twitter);
  this.stream = this.t.stream('user', { with: 'user' });
  // TODO also detect direct messages
  this.stream.on('tweet', this.processTweet.bind(this));
}

Checky.prototype.processTweet = function(tweet) {
  var self = this;
  // Only process tweets that the bot did not send and where it is mentioned.
  if (tweet.user.screen_name === this.config.twitter.screen_name) return;
  if (!_.filter(tweet.entities.user_mentions, function(um) { return um.screen_name === self.config.twitter.screen_name }).length) return;
  this.sendToWebhook(tweet);
}

Checky.prototype.sendToWebhook = function(tweet) {
  var self = this;
  // TODO log
  // TODO security
  request
    .post(this.config.webhook)
    .send({ tweet: tweet })
    .end(function(err, res) {
      if (res.body.reply) {
        self.tweetReply(res.body.reply, tweet);
      }
      else {
        // TODO error handling
      }
    });
}

Checky.prototype.tweetReply = function(reply, tweet) {
  var self = this;
  var reply_tweet = {
    status: reply,
    in_reply_to_status_id: tweet.id_str
  };
  this.t.post('statuses/update', reply_tweet, function(err, data, res) {
    // TODO log and error handling
    console.log(err);
    console.log(data);
  });
}

var checky = new Checky(config);
