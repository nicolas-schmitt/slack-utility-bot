function UrlEncoder() {}

UrlEncoder.prototype.keywords = ["urlencode", "urle"];

UrlEncoder.prototype.getHelp = function() {
    return "syntax: urlencode [text]";
};

UrlEncoder.prototype.getResponse = function(message) {
    return encodeURIComponent(message);
};

module.exports = new UrlEncoder();