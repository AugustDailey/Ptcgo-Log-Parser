
#  Welcome to PTCGO-Log-Parser
Node.js module for quickly parsing PTCGO Game logs into a more usable json representation.
<p align="left">
  <img src="https://img.shields.io/npm/v/ptcgo-log-parser.svg?color=blue" />
  <img src="https://dev.azure.com/August1441/ptcgo-log-parser/_apis/build/status/AugustDailey.Ptcgo-Log-Parser?branchName=master" />
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


  

##  Upcoming Features
- Card JSON Representations will include a link to their specific card entry in the Pokemon Card Database instead of only raw data. Link to database: https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/
- Ability to generate PTCGO decklists from log files (Helps with discovering decks that are hidden from viewing/exporting