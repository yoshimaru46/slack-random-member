# Getting Started ⚡️ Bolt for JavaScript
> Slack app example from 📚 [Getting started with Bolt for JavaScript tutorial][1]

## Overview

This is a Slack app built with the [Bolt for JavaScript framework][2] that showcases
responding to events and interactive buttons.

## Running locally

### 1. Setup environment variables

```zsh
# Replace with your signing secret and token
export SLACK_BOT_TOKEN=<your-bot-token>
export SLACK_SIGNING_SECRET=<your-signing-secret>
```

### 2. Setup your local project

```zsh
# Clone this project onto your machine
git clone https://github.com/yoshimaru46/slack-random-member.git

# Change into the project
cd slack-random-member/

# Install the dependencies
yarn
```

### 3. Start servers

[Setup ngrok][3] to create a local requests URL for development.

```zsh
yarn run ngrok
yarn run start
```

## How to deploy

refs: https://slack.dev/bolt-js/ja-jp/deployments/heroku

### 1. Create heroku app

```sh
heroku create
```

### 2. Setup environment variables

```sh
heroku config:set SLACK_SIGNING_SECRET=hoge
heroku config:set SLACK_BOT_TOKEN=xoxb-fuga
```

### 2. Deploy

```sh
git push heroku master
heroku ps:scale web=1
```