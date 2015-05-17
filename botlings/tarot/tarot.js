var Globalize = require('globalize');
var stringformat = require('string-format');

Globalize.load(require('cldr-data/supplemental/likelySubtags'), require( "cldr-data/supplemental/plurals" ));
Globalize.loadMessages(require('./messages.json'));
stringformat.extend(String.prototype);

function Tarot(locale) {
    Globalize.locale(locale);
    this.games = {};
    this.userIdFormat = /<@U[A-Z0-9]{8}>/;
}

Tarot.prototype.keywords = ['tarot'];

Tarot.prototype.getHelp = function() {
    return Globalize.messageFormatter('help')();
};

Tarot.prototype.getResponse = function(message, sender) {
    var response = '';
    var msg = this.parseMessage(message);
    var id = this.getSenderId(sender);
    var unit = msg.isFix ? -10 : 10;
    
    switch (msg.action) {
        case 'new game':
            response = this.initGame(msg.params, id);
            break;

        case 'reset':
        case 'clear':
            response = this.resetGame(id);
            break;

        case 'scores':
        case 'print':
            response = this.printScores(id);
            break;

        case 'petite':
            response = this.updateGameScores(msg.params, id, unit * 2);
            break;

        case 'garde':
            response = this.updateGameScores(msg.params, id, unit * 4);
            break;

        case 'garde sans':
            response = this.updateGameScores(msg.params, id, unit * 8);
            break;

        case 'garde contre':
            response = this.updateGameScores(msg.params, id, unit * 16);
            break;

        case 'poignée':
            response = this.updateGameScores(msg.params, id, unit * 1);
            break;

        case 'double poignée':
            response = this.updateGameScores(msg.params, id, unit * 2);
            break;

        case 'triple poignée':
            response = this.updateGameScores(msg.params, id, unit * 3);
            break;

        case 'misère':
            response = this.updateGameScores(msg.params, id, unit * 1);
            break;
            
        case 'chelem':
        case 'petit chelem':
            response = this.updateGameScores(msg.params, id, unit * 10);
            break;
            
        case 'grand chelem':
            response = this.updateGameScores(msg.params, id, unit * 20);
            break;

        default:
            response = Globalize.messageFormatter('help')();
    }
    
    return response;
};

Tarot.prototype.parseMessage = function(message) {
    var parts = message.split(' ');
    var result = {
      'action': parts[0],
      'params': '',
      'isFix': false
    };
    
    if(result.action[0] == '!') {
        result.isFix = true;
        result.action = result.action.substr(1);
    }

    if (['new', 'garde', 'double', 'triple', 'petit', 'grand'].indexOf(result.action) != -1){
        var part = parseInt(parts[1], 10);
        if (isNaN(part)) {
            result.action += ' ' + parts[1];
            result.params = parts.splice(2);
        } else {
            result.params = parts.splice(1);
        }
    }
    else {
        result.params = parts.splice(1);
    }

    return result;    
};

Tarot.prototype.getSenderId = function(sender) {
    return '<@{0}>'.format(sender.id);
};

Tarot.prototype.initGame = function(params, senderId) {
    var game = {
        'owner': senderId,
        'playerCount': 0,
        'players': {}  
    };
    
    this.addPlayerToGame(game, senderId);
    
    params.forEach(function(id){
        if (this.validateUserId(id)){
            this.addPlayerToGame(game, id);
        }
    }, this);
    
    this.games[senderId] = game;
    
    return Globalize.messageFormatter('new game')(game);
};

Tarot.prototype.validateUserId = function(id) {
    return this.userIdFormat.test(id);
};

Tarot.prototype.addPlayerToGame = function(game, playerId) {
    game.players[playerId] = 0;
    game.playerCount++;
};

Tarot.prototype.resetGame = function(senderId) {
    var result = '';
    var game = this.games[senderId];
    
    if (game) {
        Object.keys(game.players).forEach(function(id){
            game.players[id] = 0;
        });
        result = Globalize.messageFormatter('game reset')();
    }
    else {
        result = Globalize.messageFormatter('no game')();
    }
    
    return result;
};

Tarot.prototype.updateGameScores = function(params, senderId, baseGain) {
    //garde 10 <@UP30N> <@UPL0T>
    //double poignée <@UP30N>
    var result = '';
    var game = this.games[senderId];
    
    if (game) {
        var data = params;
        var changes = {
            baseGain: baseGain,
            margin: 0,
            player: '',
            teammate: ''
        };
        
        changes.margin = parseInt(data[0], 10);
        if (isNaN(changes.margin)) {
            changes.margin = 0;
        } else {
            data = params.slice(1);
        }
        
        if (this.validateUserId(data[0])) {
            changes.player = data[0];
        }
        
        if (this.validateUserId(data[1])) {
            changes.teammate = data[1];
        }
        
        if (!isNaN(changes.baseGain) && !isNaN(changes.margin) && changes.player != '') {
            this.applyscoresChanges(game, changes);
            result = this.printScores(senderId);
        } else {
            result = Globalize.messageFormatter('help')();
        }
    }
    else {
        result = Globalize.messageFormatter('no game')();
    }
    
    return result;
};

Tarot.prototype.applyscoresChanges = function(game, changes) {
    var gain = changes.baseGain >= 0 ? changes.baseGain + changes.margin : changes.baseGain - changes.margin;
    
    if (changes.teammate == '') {
        Object.keys(game.players).forEach(function(id) {
            if (id == changes.player) {
                game.players[id] += gain * (game.playerCount - 1);
            } else {
                game.players[id] -= gain;
            }
        });
    } else {
        Object.keys(game.players).forEach(function(id) {
            if (id == changes.player) {
                game.players[id] += gain * 2;
            } else if (id == changes.teammate) {
                game.players[id] += gain;
            } else {
                game.players[id] -= gain;
            }
        });
    }
};

Tarot.prototype.printScores = function(senderId) {
    var result = '';
    var game = this.games[senderId];
    
    if (game) {
        Object.keys(game.players).forEach(function(id) {
            result += '{0}: {1}; '.format(id, game.players[id]);
        });
    } else {
        result = Globalize.messageFormatter('no game')();
    }
    
    return result;
};

module.exports = Tarot;