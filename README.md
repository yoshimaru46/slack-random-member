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

### Build Image

```shell
gcloud builds submit --tag gcr.io/${PROJECT_ID}/slack-random-member
```

### Deploy

```shell
gcloud run deploy slack-random-member --image gcr.io/${PROJECT_ID}/slack-random-member --set-env-vars PROJECT_ID=${PROJECT_ID}
```