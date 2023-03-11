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

var results          = {};
var testSuites       = [];
var testCases        = [];

var aSuite;
var aCaseName;
var aSuiteName;
var aFileName;

var nestedDescribes;
var parentSuiteName;
var parentFileName;

const resultsDir     = 'cypress/results/';
const videosDir      = 'cypress/videos/';
const logsDir        = 'cypress/logs/';
const screenshotsDir = 'cypress/screenshots/';
const specRoot       = "cypress/e2e/";

function getCaseRecord(test, suitesCount, nestedDescribes) {

  // suites == 0 indicates cases with NO "Describe"
  if (suitesCount == 0) {
    aFileName  = test.parent.file;
    aSuiteName = path.basename(aFileName);
    aCaseName  = test.title;  // standard test case name. Will be overwritten for for nested Describes
  } else {
    aFileName  = test.parent.parent.file;
    aSuiteName = test.parent.title;
    aCaseName  = test.title;  // standard test case name. Will be overwritten for for nested Describes

    // Need to save this Suite as the "parent" in case there are nested Describes
    if (nestedDescribes == 0) {
      parentSuiteName = aSuiteName; // save this as the Suite Name
      parentFileName  = aFileName;
    }
    if (nestedDescribes > 0) {
      aSuiteName = parentSuiteName; // root parent name for nested Describes
      aFileName  = parentFileName;

      // Need to construct test case name using 1 or more nested "Describe" names
      var parentObj = test.parent;
      var theDescribeNames = [];
      for (let i=0; i < nestedDescribes; i++ ) {
          theDescribeNames.push(parentObj.title);
          parentObj = parentObj.parent;
      }
      theDescribeNames.reverse()
      theDescribeNames.push(test.title);
      aCaseName = theDescribeNames.join(" -- ");
    }
  }

}

function MyReporter(runner, options) {
  Base.call(this, runner, options);
  const stats = runner.stats;
  if (!fs.existsSync(resultsDir)){
    fs.mkdirSync(resultsDir);
  }

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('BEGIN ...');
    results         = {};
    testSuites      = [];
    testCases       = [];
    nestedDescribes = -2;
  });

  runner.on(EVENT_RUN_END, function() {

    var suiteAttachments = [];

    // Root record
    var rootSuite = {name: "Root Suite",  timestamp: stats.start, tests: stats.tests,  file: aFileName};
    testSuites.push({$: rootSuite});

    let testFilePathLinux  = aFileName.replace(/\\/g, "/");
    let foldersAndFile     = testFilePathLinux.split(specRoot)[1];

    var videoFile = videosDir+foldersAndFile+".mp4";
    var testVideo = "[[ATTACHMENT|"+videoFile+"]]";
    suiteAttachments.push(testVideo);

    var logFile   = logsDir+foldersAndFile.replace(".js", ".txt");
    var testLog   = "[[ATTACHMENT|"+logFile+"]]";
    suiteAttachments.push(testLog);

    aSuite = {name: aSuiteName, timestamp: stats.start, tests: stats.tests, time: stats.duration};
    var aSuiteRecord = {$: aSuite, testcase: testCases, 'system-out': suiteAttachments}
    testSuites.push(aSuiteRecord)

    // Stats
    var rootStats = {name: "Mocha Tests", time: stats.duration,   tests: stats.tests, failures: stats.failures};
    results = { testsuites: {$: rootStats, testsuite:testSuites} }

    var xml = builder.buildObject(results);
    fs.writeFileSync(resultsDir+"results."+foldersAndFile.replace(/\//g, "-")+".xml",xml);

    console.log('END   ...');
  });

  runner.on(EVENT_SUITE_BEGIN, function() {
    nestedDescribes++;
  });

  runner.on(EVENT_SUITE_END, function() {
    nestedDescribes--;
  });

  runner.on(EVENT_TEST_PASS, function(test) {
    /*
     *  Generate the case record
     */

    getCaseRecord(test, stats.suites, nestedDescribes);
    var aCase = {name: aCaseName, classname: aSuiteName, time: test.duration};
    testCases.push({$: aCase});

    //console.log('       PASSS: %s', test.fullTitle())
    //console.log("CASE:", runner.stats)

  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {

    getCaseRecord(test, stats.suites, nestedDescribes);
    var aCase = {name: aCaseName, classname: aSuiteName, time: test.duration};
    var aFailure = {$: {message: err.message, type: err.name}, _: err.stack}; // Note, to force CDATA add "<< "

    let testFilePathLinux  = aFileName.replace(/\\/g, "/");
    let foldersAndFile     = testFilePathLinux.split(specRoot)[1];
    let imgFileName        = aCaseName+' (failed).png';

    // Checking if case has no parent Describe
    let theSuiteName = aSuiteName+' -- ';
    if (stats.suites == 0 ) theSuiteName = "";

    let imageFile      = screenshotsDir+foldersAndFile+'/'+theSuiteName+imgFileName;
    let testScreenshot = "[[ATTACHMENT|"+imageFile+"]]";
    testCases.push({$: aCase, failure: aFailure, 'system-out': testScreenshot });

    //console.log('       FAIL: %s -- error: %s', test.fullTitle(), err.message, err.name, err.stack);

  });

}

module.exports = MyReporter;