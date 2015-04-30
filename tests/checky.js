define(function(require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Checky = require('intern/dojo/node!../checky.js');

  registerSuite(function () {
    var config = {
      twitter: {
        screen_name: 'testbot'
      },
      webhook: {
        secret_token: 's3cr3t'
      },
      testing: true
    }
    var tweet = {
      id_str: '1234',
      user: {
        screen_name: 'testuser'
      },
      entities: {
        user_mentions: [
          { screen_name: 'testbot' }
        ]
      }
    }
    var checky = new Checky(config);

    return {
      name: 'Checky',

      computeSignature: function () {
        // Check against output from http://www.freeformatter.com/hmac-generator.html
        assert.strictEqual(checky.computeSignature(tweet), 'sha1=4b748d1d949ee8cab09fae9480f13f9b4433e44d');
      }
    }
  });
});
