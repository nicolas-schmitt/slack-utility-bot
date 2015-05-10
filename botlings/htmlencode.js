var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

function HtmlEncoder() {}

HtmlEncoder.prototype.keywords = ["htmlencode", "htmle"];

HtmlEncoder.prototype.getHelp = function() {
    return "syntax: htmlencode [text]";
};

HtmlEncoder.prototype.getResponse = function(message) {
    return entities.encodeNonUTF(message);
};

module.exports = new HtmlEncoder();