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
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants

var aCaseName;
var aSuiteName;
var aClassName;
var aFileName;

var nestedDescribes;
var parentSuiteName;
var parentFileName;

function MyReporter(runner, options) {
  Base.call(this, runner, options);
  const stats = runner.stats;

  runner.on(EVENT_RUN_BEGIN, function() {
    console.log('BEGIN:');
    nestedDescribes = -2;
  });
  runner.on(EVENT_SUITE_BEGIN, function() {
    nestedDescribes++;
    console.log('  SUITE BEGIN ...', stats.suites, nestedDescribes);
  });
  runner.on(EVENT_SUITE_END, function() {
    console.log('  SUITE END   ...', stats.suites, nestedDescribes);
    nestedDescribes--;
  });
  runner.on(EVENT_RUN_END, function() {
    //console.log('     END: %d/%d', runner.stats.passes, runner.stats.tests);
    console.log("END:")
  });

  runner.on(EVENT_TEST_PASS, function(test) {

    // suites == 0 indicates cases with NO "Describe"
    if (runner.stats.suites == 0) {

        aFileName  = test.parent.file;
        aSuiteName = path.basename(aFileName);
        aCaseName = test.title;  // standard test case name. Will be overwritten for for nested Describes

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
            aCaseName = theDescribeNames.join("->");

        }
    }

    console.log('  TEST PASS -> ', aCaseName, aSuiteName, aFileName);
    aClassName = aSuiteName;

  });

  runner.on(EVENT_TEST_FAIL, function(test, err) {
    console.log('       FAIL: %s -- error: %s', test.fullTitle(), err.message);
  });

}

module.exports = MyReporter;