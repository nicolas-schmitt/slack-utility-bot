function HelpManual() {}

HelpManual.prototype.keywords = ["help", "aide"];

HelpManual.prototype.getHelp = function() {
    return "syntax: help [text]";
};

HelpManual.prototype.getResponse = function() {
    return "Available commands : \n" +
            "htmlencode [text] \n" +
            "htmldecode [text] \n" +
            "urlencode [text] \n" +
            "urldecode [text] \n" +
            "guid [count] [format] \n";
};

module.exports = HelpManual;