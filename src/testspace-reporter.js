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
var SUITE_COUNT;
var suites  = [];

// Settings
const RESULTS_DIR      = 'cypress/results/';
const VIDEOS_DIR       = 'cypress/videos/';
const LOGS_DIR         = 'cypress/logs/';
const SCREENSHOTS_DIR  = 'cypress/screenshots/';
const SPEC_ROOT_DIR    = "cypress/e2e/";

function createTestRecord(test) {
  var testName;
  var testFullName; // Needed for Image File naming :<
  var testFileName;
  var className;

  // Checking if Root Testsuite test cases (no Describe) - (i.e. SUITE_COUNT == 0)
  if ( test.title == test.fullTitle() ) {
    testName     = test.title;
    testFullName = test.title;
    testFileName = test.parent.file;
    className    = path.basename(test.parent.file); // trimming off the path
  } else {
    let parentObj = test.parent;
    let theDescribeNames = [];
    while (parentObj.title != '') {
      theDescribeNames.push(parentObj.title);
      className    = parentObj.title;
      testFileName = parentObj.parent.file;
      parentObj    = parentObj.parent;
    }
    theDescribeNames.reverse()
    theDescribeNames.push(test.title);
    testFullName = theDescribeNames.join(" -- ");
    testName     = testFullName.replace(className+' -- ','');
  }

  if (test.state === 'failed') {
    var err = test.err;
    var aFailure        = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "
    var imageFilePath   = testFileName.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    var imageFileName   = SCREENSHOTS_DIR+imageFilePath+'/'+testFullName+' (failed).png';
    var imageScreenshot = "[[ATTACHMENT|"+imageFileName+"]]";
    return {$: {name: testName, classname: className, time: test.duration/1000}, failure: aFailure, 'system-out': imageScreenshot};
  } else {
    return {$: {name: testName, classname: className, time: test.duration/1000}};
  }
}

function MyReporter(runner, options) {
  Base.call(this, runner, options);
  const stats = runner.stats;
  console.log("START: options:", options)
  if (!fs.existsSync(RESULTS_DIR)){
    fs.mkdirSync(RESULTS_DIR);
  }

  runner.on(EVENT_TEST_PASS, function(test) {
    console.log('       PASSS: %s', test.fullTitle())
    suites[suites.length-1].tests.push(test);  // alway use active suite
  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {
    console.log('       FAIL:  %s', test.fullTitle()); // err.message, err.name, err.stack
    suites[suites.length-1].tests.push(test);  // alway use active suite
  });

  runner.on(EVENT_SUITE_BEGIN, function(suite) {
    NESTED_DESCRIBES++;
    SUITE_COUNT++;
    var _suite = {};

    if ( SUITE_COUNT == 0) {
      _suite.name      = "Root Suite";
      _suite.file      = suite.file;
      _suite.timestamp = Date.now();
      suites.push({suite: _suite, tests: new Array()})
    } else if (SUITE_COUNT == 1) {  // "Parent Suite, any count above is considered a sub-suite"
      _suite.name      = suite.title;
      _suite.file      = suite.parent.file;
      _suite.timestamp = Date.now();
      suites.push({suite: _suite, tests: new Array()})
    }
    console.log('  SUITE BEGIN ...',stats.suites, NESTED_DESCRIBES, SUITE_COUNT);
  });

  runner.on(EVENT_SUITE_END, function(suite) {
    console.log('  SUITE END   ...',stats.suites, NESTED_DESCRIBES, SUITE_COUNT);
    SUITE_COUNT--;
    NESTED_DESCRIBES--;
  });

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('RUN BEGIN ...');
    NESTED_DESCRIBES  = -2;
    SUITE_COUNT = -1;
  });

  runner.on(EVENT_RUN_END, function() {
    console.log('RUN END   ...');

    var rootStats = {name: "Cypress Tests"};
    // !! Add Stats to Cypress Test Suite

    var testsuites = [];
    suites.forEach( function(s){
      console.log(s.suite.name);
      var testcases = [];
      s.tests.forEach( function(t){
        testcases.push(createTestRecord(t))
      })

      var attachFilePath = s.suite.file.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
      var videoFile      = VIDEOS_DIR+attachFilePath+".mp4";
      var logFile        = LOGS_DIR+attachFilePath.replace(".js", ".txt");
      var textFile       = "";
      if (fs.existsSync(logFile)) {
        textFile = fs.readFileSync(logFile, 'utf8');
      }
      var suiteAttachments = textFile+"[[ATTACHMENT|"+videoFile+"]]";

      let timeDelta = Date.now() - s.suite.timestamp;
      let timestamp = new Date(s.suite.timestamp).toISOString().slice(0, -5)
      var suite = {name: s.suite.name, timestamp: timestamp, time: timeDelta/1000, file: s.suite.file};
      var suiteRecord = {$: suite, testcase: testcases, 'system-out': suiteAttachments};
      testsuites.push(suiteRecord);
    })

    var results  = {testsuites: {$: rootStats, testsuite:testsuites} }
    var xml      = builder.buildObject(results);
    var filename = suites[0].suite.file;
    var filePath = filename.replace(/\\/g, "/").split(SPEC_ROOT_DIR)[1];
    fs.writeFileSync(RESULTS_DIR+"results."+filePath.replace(/\//g, "-")+".xml",xml);
    fs.writeFileSync("results.xml",xml);

  });

}

module.exports = MyReporter;