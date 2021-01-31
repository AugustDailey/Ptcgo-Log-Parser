const parser = require('./utils/parser.js')

exports.parse = function(input) {
    var result = parser.parse(input);
    return result;
  }