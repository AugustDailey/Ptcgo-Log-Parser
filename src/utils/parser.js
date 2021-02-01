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
        var response = { turns:[], errors:[], gs:null }

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
                var result = validateDebugGameLogLine(line, it);
                if (!result[0]) {
                    if (result[1].length > 0) {
                        response.errors.push(result[1]);
                    }
                    continue;
                }
                var turn = response.turns[result[1] - 1];
                turn.data = result[2];
            }

            if (state == parseStates.DEBUGCURRENTGAMESTATE) {
                // Nothing listed in the logs currently
            }

            if (state == parseStates.CURRENTGAMESTATE && validateCurrentGameStateLogLine(line)) {
                response.gs = buildGamestate(it);
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
        } catch (Exception) {
            // TODO: Insert error logging here?
        }
    }

    return [false, ""];
}

function validateDebugGameLogLine(line, it) {
    var index = line.indexOf(":");
    var data = { hasData:false, noDataString:"", source:null, actor:null, target:null }
    var step = -1;
    if (index > 0) {
        try {   
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
                it.next();
                data.actor = getActor(it);
                if (it.current().includes("Target")) {
                    if (it.current().includes("Card not revealed yet so there's no card data")) {
                        it.next();
                        return [true, step, data];
                    }
                    data.target = getTarget(it);
                }
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
        } catch (Exception) {  
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
    var name = it.next().substring(6);
    var set = it.next();
    var cardNumberInSet = it.next().substring(12);
    var type = it.next().substring(11);
    var entityName = it.next();
    var owner = it.next();
    it.next();

    var setData = set.split('—');
    var setString;
    var seriesString;
    if (setData.length < 2)
    {
        setString = setData[0].substring(10);
        seriesString = setData[0].substring(10);
    }
    else
    {
        seriesString = setData[0].substring(10);
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

function validateCurrentGameStateLogLine(line) {
    return line.includes("Cards Data Begins Here");
}

function buildGamestate(it) {

    var gs = {playerHand:[],playerDiscard:[],playerBench:[],playerActivePokemon:[],
        opponentHand:[],opponentDiscard:[],opponentBench:[],opponentActivePokemon:[],
        lostZone:[],stadium:null,playerDeckCount:0,playerprizeCount:0,opponentDeckCount:0,opponentPrizeCount:0}
    
    var errors = []

    // Shift Iterator
    it.next();
    it.next();

    // P1 Deck
    gs.playerDeckCount = getDeckCount(it.current());
    if (gs.playerDeckCount == -1) {
        errors.push("Error occurred when reading P1 deck count.");
    }

    // Shift Iterator
    it.next();
    it.next();

    // P1 Discard Pile
    var discardCount = getDeckCount(it.current());
    if (discardCount == -1) {
        errors.push("Error occurred when reading P1 discard pile count.");
    }

    // Shift Iterator
    it.next();

    // Read P1 Discard Pile
    for(var i = 0; i < discardCount; i++) {
        var card = getSource(it);
        if (card != null) {
            gs.playerDiscard.push(card);
        }
    }

    // Shift Iterator
    it.next();

    // P1 Active
    var activeCount = getDeckCount(it.current());
    if (activeCount == -1) {
        errors.push("Error occurred when reading P1 active pokemon count.");
    }

    // Shift Iterator
    it.next();

    // Read P1 Active Pokemon
    if (activeCount != 0) {
        gs.playerActivePokemon = getActivePokemonGroup(it);
    } else {
        // Shift Iterator
        it.next();
    }

    // P1 Bench
    var benchCount = getDeckCount(it.current());
    if (benchCount == -1) {
        errors.push("Error occurred when reading P1 bench count.");
    }

    // Shift Iterator
    it.next();

    // Read P1 Bench
    if (benchCount != 0) {
        gs.playerBench.concat(getActivePokemonGroup(it));
    } else {
        // Shift Iterator
        it.next();
    }

    // P1 Prize
    gs.playerPrizeCount = getDeckCount(it.current());
    if (gs.playerPrizeCount == -1) {
        errors.push("Error occurred when reading P1 prize card count.");
    }
    
    // Shift Iterator
    it.next();
    for (var i = 0; i < gs.playerPrizeCount; i++) {
        it.next();
    }
    it.next();

    // P1 Hand
    var handCount = getDeckCount(it.current());
    if (handCount == -1) {
        errors.push("Error occurred when reading P1 hand count.");
    }

    // Shift Iterator
    it.next();
    for(var i = 0; i < handCount; i++) {
        gs.playerHand.push(getSource(it));
    }
    it.next();

    // P2 Deck
    gs.opponentDeckCount = getDeckCount(it.current());
    if (gs.opponentDeckCount == -1) {
        errors.push("Error occurred when reading P2 deck count.");
    }

    // Shift Iterator
    it.next();
    it.next();

    // P2 Discard Pile
    var opponentdiscardCount = getDeckCount(it.current());
    if (opponentdiscardCount == -1) {
        errors.push("Error occurred when reading P2 discard pile count.");
    }

    // Shift Iterator
    it.next();

    // Read P2 Discard Pile
    for (var i = 0; i < opponentdiscardCount; i++) {
        var card = getSource(it);
        if (card != null) {
            gs.opponentDiscard.push(card);
        }
    }

    // Shift Iterator
    it.next();

    // P2 Active
    var opponentActiveCount = getDeckCount(it.current());
    if (opponentActiveCount == -1) {
        errors.push("Error occurred when reading P2 active pokemon count.");
    }

    // Shift Iterator
    it.next();

    // Read P2 Active Pokemon
    if (opponentActiveCount != 0) {
        gs.opponentActivePokemon = getActivePokemonGroup(it);
    } else {
        // Shift Iterator
        it.next();
    }

    // P2 Bench
    var opponentbenchCount = getDeckCount(it.current());
    if (opponentbenchCount == -1) {
        errors.push("Error occurred when reading P2 bench count.");
    }

    // Shift Iterator
    it.next();

    // Read P2 Bench
    if (opponentbenchCount != 0) {
        gs.opponentBench.concat(getActivePokemonGroup(it));
    } else {
        // Shift Iterator
        it.next();
    }

    // P2 Prize
    gs.opponentPrizeCount = getDeckCount(it.current());
    if (gs.opponentPrizeCount == -1) {
        errors.push("Error occurred when reading P2 prize card count.");
    }

    // Shift Iterator
    for(var i = 0; i < gs.opponentPrizeCount; i++) {
        it.next();
    }
    it.next();
    it.next();

    // P2 Hand
    var opponentHandCount = getDeckCount(it.current());
    if (opponentHandCount == -1) {
        errors.push("Error occurred when reading P2 hand count.");
    }

    // Shift Iterator
    it.next();

    // Read P2 Hand
    for (var i = 0; i < opponentHandCount; i++) {
        gs.opponentHand.push(getSource(it));
    }

    // Shift Iterator
    it.next();

    // OOP Cards (Lost Zone)
    var lostZoneCards = getDeckCountUsingSecondIndex(it.current());
    if (lostZoneCards == -1) {
        errors.push("Error occurred when reading lost zone card count.");
    }
    
    // Shift Iterator
    it.next();

    // Read Lost Zone Cards
    for (var i = 0; i < lostZoneCards; i++) {
        gs.lostZone.push(getSource(it));
    }

    // Shift Iterator
    it.next();

    // Stadium
    var stadiumCount = getDeckCountUsingSecondIndex(it.current());
    if (stadiumCount == -1) {
        errors.push("Error occurred when reading stadium count.");
    }

    // Shift Iterator
    it.next();

    // Read Stadium
    if (stadiumCount != 0) {
        gs.stadium = getSource(it);
    }

    // Shift Iterator
    it.next();

    // All Player area?
    var allPArea = getDeckCountUsingSecondIndex(it.current());
    if (allPArea == -1) {
        errors.push("Error occurred when reading all player area count.");
    }

    // Shift Iterator
    it.next();

    var response = {data:gs, errors:errors};
    return response;
}

function getDeckCount(line) {
    var index = line.indexOf(":");
    var finalIndex = line.indexOf(")");
    if (index > 0) {
        try {
            return parseInt(line.substring(index + 1, finalIndex), 10);
        } catch (Exception) {
            
        }
    }

    return -1;
}

function getDeckCountUsingSecondIndex(line) {
    var startingIndex = line.indexOf(":");
    var index = line.indexOf(":", startingIndex + 1);
    var finalIndex = line.indexOf(")");
    if (index > 0) {
        try {
            return parseInt(line.substring(index + 1, finalIndex));
        } catch (Exception) {

        }
    }

    return -1;
}

function getActivePokemonGroup(it) {
    var cards = []
    while (it.current().length > 1)
    {
        cards.push(getSource(it));
        if (it.current().includes("Card attached"))
        {
            it.next();
            it.next();
            cards.concat(getActivePokemonGroup(it));
        }
    }

    it.next();
    return cards;
}