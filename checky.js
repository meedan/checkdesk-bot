"use strict";

var Twit = require('twit');
var config = require('./config.js');

var twit = new Twit(config);

var stream = twit.stream('user');
stream.on('tweet', function(tweet) {
  console.log(tweet);
});
