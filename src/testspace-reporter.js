const Mocha   = require('mocha');
const xml2js  = require('xml2js');
const builder = new xml2js.Builder();
const fs      = require('fs');
const path    = require("path");

const Base = Mocha.reporters.Base;
// https://github.com/mochajs/mocha/wiki/Third-party-reporters
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS
} = Mocha.Runner.constants

var results         = {};
var testSuites      = [];
var testCases       = [];
var testAttachments = [];
var testVideo;

var aSuite;
var aSuiteName;
var aFileName;
var aAttachment;

const resultsDir  = 'cypress/results/';

function MyReporter(runner, options) {
  Base.call(this, runner, options);

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('BEGIN ...');
    results         = {};
    testSuites      = [];
    testCases       = [];
    testAttachments = [];
    if (!fs.existsSync(resultsDir)){
      fs.mkdirSync(resultsDir);
    }
  });

  runner.on(EVENT_RUN_END, function() {

    const specRoot        = "cypress/e2e/";

    // Root record
    var rootSuite = {name: "Root Suite",  timestamp: runner.stats.start, tests: runner.stats.tests,  file: aFileName};
    testSuites.push({$: rootSuite});

    /*
     Suite record containing testcase record(s)
     aAttachment = "[[ATTACHMENT|dashboard.png]]";
     testAttachments.push(aAttachment);
     */

    console.log(aFileName);
    let testFilePathLinux  = aFileName.replace(/\\/g, "/");
    let foldersAndFile     = testFilePathLinux.split(specRoot)[1];

    /*
    let splitFoldersFile   = foldersAndFile.split("/");
    console.log(splitFoldersFile, splitFoldersFile[splitFoldersFile.length-1]);
    var videoFile = "cypress/videos/"+path.basename(aFileName)+".mp4";
    */

    var videoFile = "cypress/videos/"+foldersAndFile+".mp4";
    testVideo = "[[ATTACHMENT|"+videoFile+"]]";

    aSuite = {name: aSuiteName, timestamp: runner.stats.start, tests: runner.stats.tests, time: runner.stats.duration};
    var aSuiteRecord = {$: aSuite, testcase: testCases, 'system-out': testVideo}

    testSuites.push(aSuiteRecord)

    // Stats
    var rootStats = {name: "Mocha Tests", time: runner.stats.duration,   tests:  runner.stats.tests, failures:  runner.stats.failures};
    results = { testsuites: {$: rootStats, testsuite:testSuites} }

    var xml = builder.buildObject(results);
    fs.writeFileSync(resultsDir+"results."+foldersAndFile.replace(/\//g, "-")+".xml",xml);

    //console.log('     END: %d/%d', runner.stats.passes, runner.stats.tests);
   // console.log("END:", runner.stats)

  });

  runner.on(EVENT_TEST_PASS, function(test) {
    /*
     *  Generate the case record
     */
    var aCaseName  = test.title;
    var aClassName = test.parent.title;
    var aTime      = test.duration;
    var aCase = {name: aCaseName, classname: aClassName, time: aTime};
    testCases.push({$: aCase});

    aSuiteName = test.parent.title;
    aFileName  = test.parent.parent.file;

    //console.log('       PASSS: %s', test.fullTitle())
    //console.log("CASE:", runner.stats)

  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {
    console.log('       FAIL: %s -- error: %s', test.fullTitle(), err.message);
  });

}

module.exports = MyReporter;