
#  Welcome to PTCGO-Log-Parser
Node.js module for quickly parsing PTCGO Game logs into a more usable json representation.
<p align="left">
  <img src="https://img.shields.io/npm/v/ptcgo-log-parser.svg?color=blue" />
  <img src="https://github.com/AugustDailey/Ptcgo-Log-Parser/workflows/PTCGO%20Log%20Parser%20CI/badge.svg" />
</p>

##  Installation

```bash

$ npm i ptcgo-log-parser

```
##  Usage

```bash

var ptcgo-parser = require('ptcgo-log-parser');

```

Read data from a file, and parse it.

```bash

var result = ptcgo-parser.parse(data);

```


## Versions
- 0.1.5 (Latest) - Clean data for turn entries and cards
- 0.1.4 - No major feature addition. Reason for publish: Don't deploy tests to npm, just source code
- 0.1.3 - No major feature addition. Reason for publish: Don't deploy tests to npm, just source code
- 0.1.2 - No major feature addition. Reason for publish: Project source code restructure
- 0.1.1 - Parsing of game log and game state is functional
- 0.1.0 - Project initialization

##  Upcoming Features
- Card JSON Representations will include a link to their specific card entry in the Pokemon Card Database instead of only raw data. Link to database: https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/
- Ability to generate PTCGO decklists from log files (Helps with discovering decks that are hidden from viewing/exporting
