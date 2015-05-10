var Guid = require('guid');
var stringformat = require('string-format');

stringformat.extend(String.prototype);

function GuidGenerator() {}

GuidGenerator.prototype.keywords = ['guid'];

GuidGenerator.prototype.getHelp = function() {
    return "syntax: guid [count] [format(N/D/B/P)]\nex: guid 5 N";
};

GuidGenerator.prototype.getResponse = function(message) {
    var params = message.split(' ');
    var response = '';
    
    switch (params.length) {
        case 0:
            response = Guid.raw();
            break;
        
        case 1:
            response = this.getSingleParamResponse(params[0]);
            break;
            
        case 2:
            response = this.getDoubleParamResponse(params);
            break;
        
        default:
            response = this.getHelp();
    }
    
    return response;
};

GuidGenerator.prototype.getSingleParamResponse = function(param){
    var result = '';
    var count = 1;
    var format = '';
    
    if (typeof(param) == 'string') {
        count = parseInt(param, 10);
        
        if (isNaN(count)) {
            count = 1;
            format = param;
        }
    } else if (typeof(param) == 'number') {
        count = param;
    }
    
    for (var i = 0; i < count; i++) {
        result += this.getFormatedGuid(format) + '\n';
    }
    
    return result;
};

GuidGenerator.prototype.getDoubleParamResponse = function(params){
    var result = '';
    var count = params[0];
    var format = params[1];
    
    if (typeof(count) == 'string') {
        count = parseInt(count, 10);
    }
    
    if (isNaN(count)) {
        count = 1;
    }
    
    for (var i = 0; i < count; i++) {
        result += this.getFormatedGuid(format) + '\n';
    }
    
    return result;
};

GuidGenerator.prototype.getFormatedGuid = function(format) {
    var result = Guid.raw();
    
    switch (format) {
        case 'n':
        case 'N':
            result = result.split('-').join('');
            break;

        case 'b':
        case 'B':
            result = '{{0}}'.format(result);
            break;
            
        case 'p':
        case 'P':
            result = '({0})'.format(result);
            break;
    }
    
    if(format != '' && 'NDBP'.indexOf(format) != -1){
        result = result.toUpperCase();
    }
    
    return result;
};

module.exports = new GuidGenerator();
