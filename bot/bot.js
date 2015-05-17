var Slack = require('slack-client');
var Globalize = require('globalize');
var stringformat = require('string-format');
var botlingsMap = require('../botlings');

Globalize.load(require('cldr-data/supplemental/likelySubtags'));
Globalize.loadMessages(require('./messages.json'));
stringformat.extend(String.prototype);

function Bot(settings) {
    var self = this;
    this.id = settings.botId;
    this.mention = '<@{0}>'.format(this.id);
    this.locale = settings.locale;
    this.locks = {};
    this.botlings = this.getBotlingsList();
    Globalize.locale(this.locale);

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
        console.log('{0}: {1}'.format(sender.name, message.text));

        var status = this.getLockStatus(message.text, sender);
        var response = '';
        
        if (status == 'unlocking') {
            response = this.getUnlockingResponse(sender);
        } else if (status == 'locked') {
            response = this.getLockedResponse(message.text, sender);
        } else {
            if (this.areYouTalkingToMe(channel, message)) {
                var cleanMessage = this.removeMention(message.text);
                status = this.getLockStatus(cleanMessage, sender);
                
                switch(status) {
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
            }
        }
        
        if (response != '') {
            channel.send(response);
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
    return botling.getResponse(cleanMessage, sender);
};

Bot.prototype.getLockingResponse = function(cleanMessage, sender) {
    cleanMessage = cleanMessage.substring(1);
    var result = '';
    var keyword = this.getKeyword(cleanMessage);
    var botling = this.findMatchingBotling(keyword);
    
    if (botling == null) {
        result = Globalize.messageFormatter('no match')(keyword);
    } else {
        result = Globalize.messageFormatter('locked')(keyword);
        this.locks[sender.id] = botling;
    }
    
    return result;
};

Bot.prototype.getUnlockingResponse = function(sender) {
    var botling = this.locks[sender.id];
    this.locks[sender.id] = null;
    
    return Globalize.messageFormatter('unlocked')(botling.keywords[0]);
};

Bot.prototype.getDefaultResponse = function(cleanMessage, sender) {
    var result = '';
    var keyword = this.getKeyword(cleanMessage);
    var botling = this.findMatchingBotling(keyword);

    if (botling == null) {
        result = Globalize.messageFormatter('no match')(keyword);
    } else {
        cleanMessage = this.removeKeyword(cleanMessage, keyword);
        result = botling.getResponse(cleanMessage, sender);
    }
    
    return result;
};

Bot.prototype.findMatchingBotling = function(keyword) {
    var result;
    
    if (keyword != null && keyword != '') {
        keyword = keyword.toLowerCase();
        result = this.botlings[keyword];
    }
    
    return result || null;
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

Bot.prototype.getBotlingsList = function() {
    var result = {};
    var Botling;
    var botling;

    Object.keys(botlingsMap).forEach(function(name){
        Botling = botlingsMap[name];
        botling = new Botling(this.locale);
        botling.keywords.forEach(function(keyword){
            result[keyword] = botling;
        }, this);
    }, this);
    
    return result;
};

module.exports = Bot;
