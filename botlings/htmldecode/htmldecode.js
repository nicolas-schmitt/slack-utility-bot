var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

function HtmlDecoder() {}

HtmlDecoder.prototype.keywords = ["htmldecode", "htmld"];

HtmlDecoder.prototype.getHelp = function() {
    return "syntax: htmldecode [text]";
};

HtmlDecoder.prototype.getResponse = function(message) {
    return entities.decode(message);
};

module.exports = HtmlDecoder;