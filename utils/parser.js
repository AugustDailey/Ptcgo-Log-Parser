const iterator = require('./iterator.js')

const parseStates = {
    NOTREADING: 0,
    GAMELOG: 1,
    DEBUGGAMELOG: 2,
    CURRENTGAMESTATE: 3,
    DEBUGCURRENTGAMESTATE: 4
}

var state = parseStates.NOTREADING;

module.exports = {
    
    parse: function(logs) {
        // Setup
        var logArray = logs.split("\n");
        var it = iterator.build(logArray);
        var line = "";

        // Return values
        var response = { turns:[], errors:[] }

        while(it.next() != null) {

            line = it.current();
            validateLogParsingState(line);

            if (state == parseStates.GAMELOG) {
                var result = validateGameLogLine(line);
                if (!result[0]) {
                    if (result[1].length > 0) {
                        response.errors.push(result[1]);
                    }
                    continue;
                }

                var turn = { number: result[1], entry: result[2], data: null }
                response.turns.push(turn);

            }

            if (state == parseStates.DEBUGGAMELOG) {
                var result = validateDebugGameLogLing(line, it);
                if (!result[0]) {
                    if (result[1].length > 0) {
                        response.errors.push(result[1]);
                    }
                    continue;
                }
                var turn = response.turns[result[1] - 1];
                turn.data = result[2];
            }
        }

        return response;
    }
}


function validateLogParsingState(line) {
    if (line.includes("Game Log Output Begins Here:")) {
        state = parseStates.GAMELOG;
    } else if (line.includes("Debug Game Log Output Begins Here")) {
        state = parseStates.DEBUGGAMELOG;
    } else if (line.includes("Cards Data Begins Here")) {
        state = parseStates.CURRENTGAMESTATE;
    } else if (line.includes("Debug Current Game State Output Begins Here")) {
        state = parseStates.DEBUGCURRENTGAMESTATE;
    } 
}

function validateGameLogLine(line) {
    var step = -1;
    var val = "";
    var index = line.indexOf(".");
    if (index > 0) {
        try {
            step = parseInt(line.substring(0, index), 10);
            if (isNaN(step)) {
                return [false, "An error occured while parsing the game log."];
            }
            val = line.substring(index + 2, line.length);
            return [true, step, val];
        } 
        catch (Exception) {
            // TODO: Insert error logging here?
        }
    }

    return [false, ""];
}

function validateDebugGameLogLing(line, it) {
    var index = line.indexOf(":");
    var data = { hasData:false, noDataString:"", source:null, actor:null, target:null }
    var step = -1;
    if (index > 0)
    {
        try
        {   
            step = parseInt(line.substring(index + 1, line.length), 10);
            if (isNaN(step)) {
                return [false, "An error occured while parsing the debug game log."];
            }
            var entry = it.next();
            var source = it.next();

            if (source.includes("No debug data found")) {
                data.hasData = false;
                data.noDataString = source;
            } else if (source.includes("Card not revealed yet so there's no card data")) {
                data.hasData = true;
                data.actor = getActor(it);
            } else {
                data.hasData = true;
                data.source = getSource(it);
                data.actor = getActor(it);
                if (it.current().includes("Target")) {
                    if (it.current().includes("Card not revealed yet so there's no card data")) {
                        it.next();
                        return [true, step, data];
                    }
                    data.target = getTarget(it);
                }
            }

            return [true, step, data];
        }
        catch (Exception) {  
            // TODO: Insert error logging here?
        }
    }

    return [false, ""];
}

function getSource(it) {
    if (it.current().includes("not yet revealed"))
    {
        it.next();
        return {};
    }

    // Begining state: "Source:"
    var name = it.next();
    var set = it.next();
    var cardNumberInSet = it.next();
    var type = it.next();
    var entityName = it.next();
    var owner = it.next();
    it.next();

    var setData = set.split('—');
    var setString;
    var seriesString;
    if (setData.length < 2)
    {
        setString = setData[0];
        seriesString = setData[0];
    }
    else
    {
        seriesString = setData[0];
        setString = setData[1];
    }
    var card = 
    {
        cardNumber: cardNumberInSet,
        name: name,
        seriesName: seriesString,
        setName: setString,
        hasBeenLookedUp: false,
        type: type
    };

    return card;
}


function getActor(it) {
    // Begining state: "Actor:"
    it.next();
    it.next();
    it.next();
    it.next();
    it.next();
    var player = it.next();
    it.next();
    return player;
}

function getTarget(it) {
    return getSource(it);
}