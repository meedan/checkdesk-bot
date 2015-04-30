Checky, the Checkdesk bot
=========================

Checky listens on Twitter for users sending Checkdesk reports (i.e., media URLs), and responds appropriately. The user can specify a Checkdesk story hashtag to add the report to that specific story.

If the user is known to Checkdesk, submission can be done directly on their behalf. Otherwise, the user is asked to navigate to the report submission form where they have to login/register first before submitting the report themselves.

In case the report already exists in Checkdesk, Checky answers with the report status and a link to it.

# Configuration
- Create Twitter app with *Read, Write and Access direct messages* access
- Create Twitter account for bot and allow it to receive direct messages from anyone
- Authorize bot account for app as per http://dghubble.com/blog/posts/twitter-app-write-access-and-bots/
- Create `config.js` based on `config.js.example`, filling in the Twitter information above
- Fill in `webhook.callback_url` with the full URL of the Checkdesk bot REST endpoint, e.g. `http://meedan.checkdesk.org/en/api/v1/bot`
- Fill in `webhook.secret_token` with a secret passphrase that you enter on the Checkdesk side, at `http://meedan.checkdesk.org/en/admin/config/services/checkdesk-bot`
- Run `node app.js` and send mentions or direct messages to the bot account

# Testing
- Install [Intern](https://theintern.github.io/) via `npm install intern`
- Run `intern-client config=tests/intern`
