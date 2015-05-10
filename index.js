var Slack = require('slack-client');
var stringformat = require('string-format');
var botlings = require('./botlings');

stringformat.extend(String.prototype);

function Bot(settings) {
    var self = this;
    this.slack = new Slack(settings.slackToken, settings.autoReconnect, settings.autoMark);
    this.id = settings.botId;
    this.mention = '<@{0}>'.format(this.id);

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
            var keyword = this.getKeyword(cleanMessage);
            var botling = this.findMatchingBotling(keyword);
    
            if (botling != null){
                cleanMessage = this.removeKeyword(cleanMessage, keyword);
                var response = botling.getResponse(cleanMessage);
                if (response != '') {
                    channel.send(response);
                }
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
