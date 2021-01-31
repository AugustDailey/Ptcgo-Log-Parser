const assert = require( "assert" );
const fs = require('fs');
const moduleUnderTest = require("../index.js");

const testCaseFolder = './testCases/';
var files = [];


describe( "Ptcgo log parser", () => {
    before( () => {
        fs.readdirSync(testCaseFolder).forEach(file => {
            if(file.includes("logs.txt")) {
                files.push(file);
            }
          });
    });
  
    describe( "parsing", () => {
        it( "Should have no errors in any parsing test case", () => {
        files.forEach(file => {
            const data = fs.readFileSync(testCaseFolder + file, 'utf8');
            var result = moduleUnderTest.parse(data);
            assert.strictEqual(result.errors, []);
        });
        } );
    });
});
