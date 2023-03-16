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
var TESTSUITE_RECORDS;
var ROOT_TESTSUITE_CASES;
var PARENT_TESTSUITE_CASES;
var NESTED_DESCRIBES;
var SUITE_NAME;
var SPEC_FILENAME;

// Settings
const RESULTS_DIR      = 'cypress/results/';
const VIDEOS_DIR       = 'cypress/videos/';
const LOGS_DIR         = 'cypress/logs/';
const SCREENSHOTS_DIR  = 'cypress/screenshots/';
const SPEC_ROOT_DIR    = "cypress/e2e/";

function getCaseRecord(test) {
  var className;
  var caseRecord;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. test.title == test.fullTitle())
  if ( NESTED_DESCRIBES == -1 ) {

    SPEC_FILENAME = test.parent.file;
    className  = path.basename(SPEC_FILENAME); // trimming off the path
    caseRecord = {name: test.title, classname: className, time: test.duration/1000};
    return {'testsuite': ROOT_TESTSUITE_CASES, 'caserecord': caseRecord, 'fullCaseName': test.title};

  } else {

    // Need to save the fileName based on the Parent Suite
    if (NESTED_DESCRIBES == 0) {
      SUITE_NAME    = test.parent.title;
      SPEC_FILENAME = test.parent.parent.file;
    }

    let fullCaseName;  // Needed for Image File naming :<
    let caseName;
    let parentObj = test.parent;
    let theDescribeNames = [];
    for (let i=0; i <= NESTED_DESCRIBES; i++ ) {
      theDescribeNames.push(parentObj.title);
      parentObj = parentObj.parent;
    }
    theDescribeNames.reverse()
    theDescribeNames.push(test.title);
    caseName     = theDescribeNames.join(" -- ")
    fullCaseName = caseName;
    className    = SUITE_NAME;
    className    = theDescribeNames.shift();;
    caseName     = caseName.replace(className+' -- ','');
    caseRecord   = {name: caseName, classname: className, time: test.duration/1000};
    return {'testsuite': PARENT_TESTSUITE_CASES, 'caserecord': caseRecord, 'fullCaseName': fullCaseName };
  }

}

function MyReporter(runner, options) {
  Base.call(this, runner, options);
  const stats = runner.stats;
  if (!fs.existsSync(RESULTS_DIR)){
    fs.mkdirSync(RESULTS_DIR);
  }

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('RUN BEGIN ...');
    TESTSUITE_RECORDS    = [];
    ROOT_TESTSUITE_CASES = [];
    NESTED_DESCRIBES  = -2;
  });

  runner.on(EVENT_RUN_END, function() {
    console.log('RUN END   ...');
    var rootStats = {name: "Cypress Tests"};
    var results   = {testsuites: {$: rootStats, testsuite:TESTSUITE_RECORDS} }
    var xml       = builder.buildObject(results);

    var filePath   = SPEC_FILENAME.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    fs.writeFileSync(RESULTS_DIR+"results."+filePath.replace(/\//g, "-")+".xml",xml);
    // console.log(xml)
    // fs.writeFileSync("results.xml",xml);
  });

  runner.on(EVENT_SUITE_BEGIN, function() {
    NESTED_DESCRIBES++;
    if ( NESTED_DESCRIBES == 0  ) PARENT_TESTSUITE_CASES = []; // initialized for each Parent Suite
    console.log('  SUITE BEGIN ...',stats.suites, NESTED_DESCRIBES);
  });

  runner.on(EVENT_SUITE_END, function() {
    console.log('  SUITE END   ...',stats.suites, NESTED_DESCRIBES);

    var suiteAttachments = [];
    var attachFilePath   = SPEC_FILENAME.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    var videoFile        = VIDEOS_DIR+attachFilePath+".mp4";
    suiteAttachments.push("[[ATTACHMENT|"+videoFile+"]]");

    var logFile   = LOGS_DIR+attachFilePath.replace(".js", ".txt");
    suiteAttachments.push("[[ATTACHMENT|"+logFile+"]]");

    if (NESTED_DESCRIBES == 0 ){
      let parentSuite = {name: SUITE_NAME, file: SPEC_FILENAME,};
      let suiteRecord = {$: parentSuite, testcase: PARENT_TESTSUITE_CASES, 'system-out': suiteAttachments}
      TESTSUITE_RECORDS.push(suiteRecord)
    }
    if (NESTED_DESCRIBES == -1) {
      let rootRecord;
      let rootSuite  = {name: "Root Suite",  file: SPEC_FILENAME};
      if (ROOT_TESTSUITE_CASES.length == 0) {
        rootRecord = {$: rootSuite, testcase: ROOT_TESTSUITE_CASES};
      } else {
        rootRecord = {$: rootSuite, testcase: ROOT_TESTSUITE_CASES, 'system-out': suiteAttachments};
      }
      TESTSUITE_RECORDS=[rootRecord].concat(TESTSUITE_RECORDS); // Inserting testsuite to 1st record
    }
    NESTED_DESCRIBES--;
  });

  runner.on(EVENT_TEST_PASS, function(test) {
    var recordInfo    = getCaseRecord(test);
    var theTestsuite  = recordInfo.testsuite;
    var theCaserecord = recordInfo.caserecord;
    theTestsuite.push({$: theCaserecord});
    console.log('       PASSS: %s', test.fullTitle(),stats.suites, NESTED_DESCRIBES)
  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {

    var recordInfo      = getCaseRecord(test);
    var theTestsuite    = recordInfo.testsuite;
    var theCaserecord   = recordInfo.caserecord;
    var thefullCaseName = recordInfo.fullCaseName;

    var aFailure = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "

    var imageFilePath   = SPEC_FILENAME.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    var imageFileName   = SCREENSHOTS_DIR+imageFilePath+'/'+thefullCaseName+' (failed).png';
    var imageScreenshot = "[[ATTACHMENT|"+imageFileName+"]]";

    theTestsuite.push({$: theCaserecord, failure: aFailure, 'system-out': imageScreenshot}); // Note, test.duration "Undefined" when fails?
    console.log('       FAIL:  %s', test.fullTitle(), stats.suites, NESTED_DESCRIBES); // err.message, err.name, err.stack
  });

}

module.exports = MyReporter;