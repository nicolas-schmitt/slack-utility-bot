var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

function HtmlEncoder() {}

HtmlEncoder.prototype.keywords = ["htmldecode", "htmld"];

HtmlEncoder.prototype.getHelp = function() {
    return "syntax: htmldecode [text]";
};

HtmlEncoder.prototype.getResponse = function(message) {
    return entities.decode(message);
};

module.exports = new HtmlEncoder();