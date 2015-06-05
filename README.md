Checky, the Checkdesk bot
=========================

The Checky bot just forwards tweets where it is mentioned and DMs addressed to it to a webhook, and ensures that the intended reply is published back to Twitter on the corresponding channel.

# Configuration
- Run `npm install`
- Create Twitter app with *Read, Write and Access direct messages* access
- Create Twitter account for bot and allow it to receive direct messages from anyone
- Authorize bot account for app as per http://dghubble.com/blog/posts/twitter-app-write-access-and-bots/
- Create `config.js` based on `config.js.example`, filling in the Twitter information above
- Fill in `webhook.callback_url` with the full URL of the Checkdesk bot REST endpoint, e.g. `http://meedan.checkdesk.org/en/api/v1/bot`
- Fill in `webhook.secret_token` with a secret passphrase that you enter on the Checkdesk side, at `http://meedan.checkdesk.org/en/admin/config/services/checkdesk-bot`
- Run `npm start` and send mentions or direct messages to the bot account

# Testing
Testing using [Intern](https://theintern.github.io/)
- Run `npm test`

# Docker
- Build using `docker build -t checkdesk-bot .`
- Run using `docker rm checkdesk-bot && docker run -it --name checkdesk-bot checkdesk-bot`
- Log into the container using `docker exec -it checkdesk-bot bash`
- Find out your host's IP using `netstat -nr | grep '^0\.0\.0\.0' | awk '{print $2}'` (from within the container)
