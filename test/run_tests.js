const assert = require( "assert" );
const fs = require('fs');
const moduleUnderTest = require("../src/index.js");

const testCaseFolder = './test/testCases/';
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
                assert.deepStrictEqual(result.errors, []);
            });
        } );
    });
});
