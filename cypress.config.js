const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "yabpvp",
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/results.[hash].xml',
  },
  e2e: {
    setupNodeEvents(on, config) {
      const options = {
        printLogsToConsole: "always",
        printLogsToFile: "always",
        outputRoot: config.projectRoot + '/cypress/',
        specRoot: 'cypress/e2e',
        outputTarget: {
          'logs|json': 'json',
          'logs|txt': 'txt',
        }
      };
      require('cypress-terminal-report/src/installLogsPrinter')(on, options);
      // implement node event listeners here
    },
  },
});
