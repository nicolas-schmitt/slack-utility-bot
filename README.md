# Slack Utility Bot
A very simple slack bot providing various utility services.

## Installation
Clone this repository
```sh
git clone https://github.com/nicolas-schmitt/slack-utility-bot.git slack-utility-bot
```
Install
```sh
npm install
```
Create a new settings file from the blank one
```sh
cp slack-utility-bot/bin/settings-blank.js slack-utility-bot/bin/settings.js
```
Update the settings file
```sh
vi slack-utility-bot/bin/settings.js
```

## Features

### Html encode
Encode all non UTF characters
**keywords :** htmlencode, htmle

### Html decode
Decode all non UTF characters
**keywords :** htmldecode, htmld

### URL encode
Encode special characters into URL format
**keywords :** urlencode, urle

### URL decode
Decode special characters from URL format
**keywords :** urldecode, urld

### Guid Generation
Create GUID formated strings
**keywords :** guid
