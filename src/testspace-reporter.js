const Mocha   = require('mocha');
const xml2js  = require('xml2js');
const builder = new xml2js.Builder({cdata: true});
const fs      = require('fs');
const path    = require("path");

const Base = Mocha.reporters.Base;
// https://github.com/mochajs/mocha/wiki/Third-party-reporters
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants

// Global Variables
var NESTED_DESCRIBES;   // -1 = ROOT, 0 = TESTSUITE, > 0 = NESTED
var TESTSUITE_RECORDS;

var ROOT_TESTSUITE_CASES;
var PARENT_TESTSUITE_CASES;

var _TS;
var _TS_CASES;

var _TESTSUITE = {
  name: "s1",
  file: "test.cy.js",
  timestamp: 0,
  time: 0.0,
}
var _ROOTSUITE = {
  name: "Root Suite",
  file: "test.cy.js",
  timestamp: 0,
  time: 0.0,
}

// Settings
const RESULTS_DIR      = 'cypress/results/';
const VIDEOS_DIR       = 'cypress/videos/';
const LOGS_DIR         = 'cypress/logs/';
const SCREENSHOTS_DIR  = 'cypress/screenshots/';
const SPEC_ROOT_DIR    = "cypress/e2e/";

function getCaseRecord(test) {
  var caseName;
  var fullCaseName; // Needed for Image File naming :<
  var className;
  var caseRecord;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. test.title == test.fullTitle())
  if ( NESTED_DESCRIBES == -1 ) {
    caseName     = test.title;
    fullCaseName = test.title;
    className  = path.basename(_TS.file); // trimming off the path

  } else {

    let parentObj = test.parent;
    let theDescribeNames = [];
    for (let i=0; i <= NESTED_DESCRIBES; i++ ) {
      theDescribeNames.push(parentObj.title);
      parentObj = parentObj.parent;
    }
    theDescribeNames.reverse()
    theDescribeNames.push(test.title);

    fullCaseName = theDescribeNames.join(" -- ");
    className    = _TS.name;
    caseName     = fullCaseName.replace(className+' -- ','');
  }

  caseRecord = {name: caseName, classname: className, time: test.duration/1000};
  return {'testsuite': _TS_CASES, 'caserecord': caseRecord, 'fullCaseName': fullCaseName };
}

function MyReporter(runner, options) {
  Base.call(this, runner, options);
  const stats = runner.stats;
  console.log("START: options:", options)
  if (!fs.existsSync(RESULTS_DIR)){
    fs.mkdirSync(RESULTS_DIR);
  }

  runner.on(EVENT_TEST_PASS, function(test) {
    var recordInfo    = getCaseRecord(test);
    var theTestsuite  = recordInfo.testsuite;
    var theCaserecord = recordInfo.caserecord;
    theTestsuite.push({$: theCaserecord});
    console.log('       PASSS: %s', test.fullTitle())
  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {
    var recordInfo      = getCaseRecord(test);
    var theTestsuite    = recordInfo.testsuite;
    var theCaserecord   = recordInfo.caserecord;
    var thefullCaseName = recordInfo.fullCaseName;

    var aFailure        = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "
    var imageFilePath   = _TS.file.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    var imageFileName   = SCREENSHOTS_DIR+imageFilePath+'/'+thefullCaseName+' (failed).png';
    var imageScreenshot = "[[ATTACHMENT|"+imageFileName+"]]";

    theTestsuite.push({$: theCaserecord, failure: aFailure, 'system-out': imageScreenshot}); // Note, test.duration "Undefined" when fails?
    console.log('       FAIL:  %s', test.fullTitle()); // err.message, err.name, err.stack
  });

  runner.on(EVENT_SUITE_BEGIN, function(suite) {
    NESTED_DESCRIBES++;
    if ( NESTED_DESCRIBES == -1 ) {
      ROOT_TESTSUITE_CASES = [];
      _ROOTSUITE.name      = "Root Suite";
      _ROOTSUITE.file      = suite.file;
      _ROOTSUITE.timestamp = Date.now();
      _TS       = _ROOTSUITE;
      _TS_CASES = ROOT_TESTSUITE_CASES;
    }
    if ( NESTED_DESCRIBES == 0  ) {
      PARENT_TESTSUITE_CASES = []; // initialized for each Parent Suite
      _TESTSUITE.name      = suite.title;
      _TESTSUITE.file      = suite.parent.file;
      _TESTSUITE.timestamp = Date.now();
      _TS       = _TESTSUITE;
      _TS_CASES = PARENT_TESTSUITE_CASES;
    }
    console.log('  SUITE BEGIN ...',stats.suites, NESTED_DESCRIBES);
  });

  runner.on(EVENT_SUITE_END, function(suite) {
    console.log('  SUITE END   ...',stats.suites, NESTED_DESCRIBES);

    // FIX THIS HACK
    if (NESTED_DESCRIBES > 0 ) {
      NESTED_DESCRIBES--;
      return;  // NOTHING TO YET
    }

    if (NESTED_DESCRIBES == -1) {
      _TS       = _ROOTSUITE;
      _TS_CASES = ROOT_TESTSUITE_CASES;
    }

    var attachFilePath   = _TS.file.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    var videoFile        = VIDEOS_DIR+attachFilePath+".mp4";
    var logFile          = LOGS_DIR+attachFilePath.replace(".js", ".txt");
    var textFile         = fs.readFileSync(logFile, 'utf8')
    var suiteAttachments = textFile+"[[ATTACHMENT|"+videoFile+"]]";

    let timeDelta = Date.now() - _TS.timestamp;
    let timestamp = new Date(_TS.timestamp).toISOString().slice(0, -5)
    let parentSuite = {name: _TS.name, timestamp: timestamp, time: timeDelta/1000, file: _TS.file};

    if (_TS_CASES.length == 0) suiteAttachments = null;

    let suiteRecord = {$: parentSuite, testcase: _TS_CASES, 'system-out': suiteAttachments}
    TESTSUITE_RECORDS.push(suiteRecord);

    //TESTSUITE_RECORDS=[rootRecord].concat(TESTSUITE_RECORDS); // Inserting testsuite to 1st record
    NESTED_DESCRIBES--;
  });

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('RUN BEGIN ...');
    TESTSUITE_RECORDS = [];
    NESTED_DESCRIBES  = -2;
  });

  runner.on(EVENT_RUN_END, function() {
    console.log('RUN END   ...');
    var rootStats = {name: "Cypress Tests"};
    var results   = {testsuites: {$: rootStats, testsuite:TESTSUITE_RECORDS} }
    var xml       = builder.buildObject(results);

    var filePath   = _TS.file.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    fs.writeFileSync(RESULTS_DIR+"results."+filePath.replace(/\//g, "-")+".xml",xml);
    //fs.writeFileSync("results.xml",xml);
  });

}

module.exports = MyReporter;