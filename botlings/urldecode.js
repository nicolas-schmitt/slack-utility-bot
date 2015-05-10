function UrlDecoder() {}

UrlDecoder.prototype.keywords = ["urldecode", "urld"];

UrlDecoder.prototype.getHelp = function() {
    return "syntax: urldecode [text]";
};

UrlDecoder.prototype.getResponse = function(message) {
    return decodeURIComponent(message);
};

module.exports = new UrlDecoder();