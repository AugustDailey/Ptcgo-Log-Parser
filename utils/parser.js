const parseStates = {
    NOTREADING: 0,
    GAMELOG: 1,
    DEBUGGAMELOG: 2,
    CURRENTGAMESTATE: 3,
    DEBUGCURRENTGAMESTATE: 4
}


function parse(logs) {

    // Setup
    var logArray = logs.split("\n");
    var it = iterator.build(logArray);
    var line = it.next();
    var state = parseStates.NOTREADING;

    // Return values
    var response = { turns = [] }

    while(line != null) {
        validateLogParsingState(line);

        if (state == parseStates.GAMELOG) {
            var result = validateGameLogLine(line);
            if (!result[0]) {
                break;
            }

            var turn = { number = result[1], entry = result[2] }
            response.turns.push(turn);

        }
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
    var index = line.IndexOf(".");
    if (index > 0) {
        try {
            step = parseInt(line.Substring(0, index), 10);
            if (isNaN(step)) {
                return [false, -1, val];
            }
            val = line.Substring(index, line.length - 1 - index);
            return [true, step, val];
        } 
        catch (Exception)
        {
            // TODO: Insert error logging here?
        }
    }

    return [false, -1, val];
}