"use strict";

var twit = require('twit');
var config = require('./config.js');
var _ = require('underscore');
var request = require('superagent');

var t = new twit(config.twitter);
var stream = t.stream('user', { with: 'user' });
stream.on('tweet', function(tweet) {
  // Only process tweets that the bot did not send and where it is mentioned.
  if (tweet.user.screen_name === config.twitter.screen_name) return;
  if (!_.filter(tweet.entities.user_mentions, function(um) { return um.screen_name === config.twitter.screen_name }).length) return;
  sendToCheckdesk(tweet);
});

function sendToCheckdesk(tweet) {
  // TODO log
  request
    .post(config.checkdesk_url + '/api/v1/bot')
    .send({ tweet: tweet })
    .end(function(err, res) {
        // Post back to Twitter.
      if (res.body.reply) {
        var reply = res.body.reply;
        reply.in_reply_to_status_id = tweet.id_str;
        t.post('statuses/update', reply, function(err, data, res) {
          console.log(err);
          console.log(data);
        });
      }
    });
}
