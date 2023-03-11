const xml2js = require('xml2js');
const builder = new xml2js.Builder({cdata: true});
const fs = require('fs');

var results     = {};
var testSuites  = [];
var testCases   = [];
var testAttachments = [];

var aSuite;
var aCase;
var aAttachment;

// Example
var rootStats = {name: "Tests", time: "3.650", tests: 2, failures: "0"};
var rootSuite = {name: "Root Suite", timestamp: "2023-03-01T23:04:45", file: "folder/test.js"};

aSuite = rootSuite;

testSuites.push({$: aSuite});

aAttachment = "[[ATTACHMENT|dashboard.png]]";
testAttachments.push(aAttachment);

aCase = {name: "c1", classname: "class1", time: "1"};
testCases.push({$: aCase, 'system-out': testAttachments});
aCase = {name: "c2", classname: "class1", time: "2"};

errMessage = "Expected 1 to equal 1";
cDATA      = "& my non-parsed data";

aFailure = {$: {message: errMessage, type: "Assertion"}, _: cDATA};

theFailure = {$: aFailure}
testCases.push({$: aCase, failure: aFailure});

aSuite = {name: "s1", timestamp: "2023-03-01T23:04:45", tests: "2", time: "1" };

logFile = "cypress/logs/test0.cy.txt";
testLog = "[[ATTACHMENT|"+logFile+"]]";
testAttachments.push(testLog);
testSuites.push({$: aSuite, testcase: testCases, 'system-out': testAttachments })

results = { testsuites: {$: rootStats, testsuite:testSuites} }

var xml = builder.buildObject(results);
fs.writeFileSync("results.xml",xml)
console.log(xml);