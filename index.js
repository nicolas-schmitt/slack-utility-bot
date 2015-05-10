var Slack = require('slack-client');
var stringformat = require('string-format');
var botlings = require('./botlings');

stringformat.extend(String.prototype);

function Bot(settings) {
    var self = this;
    this.id = settings.botId;
    this.mention = '<@{0}>'.format(this.id);
    this.locks = {};

    this.slack = new Slack(settings.slackToken, settings.autoReconnect, settings.autoMark);
    this.slack.on('message', function(message){
        self.getResponse(message);
    });
}

Bot.prototype.connect = function() {
    return this.slack.login();
};

Bot.prototype.getResponse = function(message) {
    var channel = this.slack.getChannelGroupOrDMByID(message.channel);
    var sender = this.slack.getUserByID(message.user);
    
    if (message.type == 'message' && channel != null)
    {
        console.log(sender.name);
        console.log(message.text);
        
        if (this.areYouTalkingToMe(channel, message)) {
            var cleanMessage = this.removeMention(message.text);
            var status = this.getLockStatus(cleanMessage, sender);
            var response = '';
            
            switch(status) {
                case 'locked':
                    response = this.getLockedResponse(cleanMessage, sender);
                    break;
                case 'locking':
                    response = this.getLockingResponse(cleanMessage, sender);
                    break;
                case 'unlocking':
                    response = this.getUnlockingResponse(sender);
                    break;
                default:
                    response = this.getDefaultResponse(cleanMessage, sender);
                    break;
            }
            
            if (response != '') {
                channel.send(response);
            }
        }
    }
};

Bot.prototype.areYouTalkingToMe = function(channel, message) {
    var result = false;
    
    if (channel.is_im) {
        result = true;
    } else {
        result = message.text.indexOf(this.mention) != -1;
    }

    return result;
};

Bot.prototype.removeMention = function(text) {
    var result = text.split(this.mention).join('');
    if (result[0] == ':') {
        result = result.substring(1);
    }
    
    return result.trim();
};

Bot.prototype.getLockStatus = function(text, sender) {
    var status = 'default';
    var userId = sender.id;

    if (text == '--') {
        status = 'unlocking';
    } else if (text[0] == '+') {
        status = 'locking';
    } else if (typeof(this.locks[userId]) == 'object' && this.locks[userId] != null) {
        status = 'locked';
    }

    return status;
};

Bot.prototype.getLockedResponse = function(cleanMessage, sender) {
    var botling = this.locks[sender.id];
    return botling.getResponse(cleanMessage);
};

Bot.prototype.getLockingResponse = function(cleanMessage, sender) {
    cleanMessage = cleanMessage.substring(1);
    var result = '';
    var keyword = this.getKeyword(cleanMessage);
    var botling = this.findMatchingBotling(keyword);
    
    if (botling == null) {
        result = 'Found no botling matching ' + keyword;
    } else {
        result = 'Locked on ' + keyword;
        this.locks[sender.id] = botling;
    }
    
    return result;
};

Bot.prototype.getUnlockingResponse = function(sender) {
    var botling = this.locks[sender.id];
    this.locks[sender.id] = null;
    
    return 'Unlocked from ' + botling.keywords[0];
};

Bot.prototype.getDefaultResponse = function(cleanMessage, sender) {
    var result = '';
    var keyword = this.getKeyword(cleanMessage);
    var botling = this.findMatchingBotling(keyword);

    if (botling == null) {
        result = 'Found no botling matching ' + keyword;
    } else {
        cleanMessage = this.removeKeyword(cleanMessage, keyword);
        result = botling.getResponse(cleanMessage);
    }
    
    return result;
};

Bot.prototype.findMatchingBotling = function(keyword) {
    var result = null;
    
    if (keyword != null && keyword != '') {
        keyword = keyword.toLowerCase();
        Object.keys(botlings).forEach(function(name){
            if(botlings[name].keywords.indexOf(keyword) != -1) {
                result = botlings[name];
            }
        }, this);
    }
    
    return result;
};

Bot.prototype.getKeyword = function(text) {
    var result = '';
    var index = text.indexOf(' ');
    if (index > 0) {
        result = text.substr(0, index);
    } else {
        result = text;
    }
    
    return result;
};

Bot.prototype.removeKeyword = function(text, keyword) {
    return text.substr(keyword.length + 1);
};

module.exports = Bot;
