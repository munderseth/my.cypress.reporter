const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "yk4k3j",
  //reporter: 'cypress-xml-reporter',
  //reporter: 'cypress-mochawesome-reporter',
  /*
  reporter: 'xunit',
  reporterOptions: {
    output: 'results-xunit.xml',
  },
  */
  /*
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/results.[hash].xml',
  },
  */
  e2e: {
    setupNodeEvents(on, config) {
      const options = {
        printLogsToConsole: "always", // onFail or always
        printLogsToFile: "always",    // onFail or always
        outputRoot: config.projectRoot + '/cypress/',
        specRoot: 'cypress/e2e',
        outputTarget: {
          'logs|json': 'json',
          'logs|txt': 'txt',
        }
      };
      require('cypress-terminal-report/src/installLogsPrinter')(on, options);
      require('cypress-xml-reporter/src/plugin') (on);
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
