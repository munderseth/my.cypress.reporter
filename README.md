# Cypress Testspace Reporter
This is a prototype/sandbox to learn the reporter requirement specifics.

## Usage
To use the reporter:

```
npx cypress run --reporter src/testspace-reporter.js
```
```
testspace cypress/results/results*.xml "#SOME-NAME"
```

Using options (specific file(s), turn off cypress console):

```
npx cypress run --reporter src/testspace-reporter.js --spec cypress/e2e/test1.cy.js --quiet
```
To force test failures:

```
npx cypress run --reporter src/testspace-reporter.js --quiet --env CHECK=0
```

Using with Cypress Cloud:
```
npx cypress run --record --key 784648e4...
```
The key setting can be found under *Project settings*. Note that `cypress.config.js` requires a `projectId` setting, also under *Project settings*.

## Setup
he following steps required to setup frome scratch.

`.gitignore`
```
node_modules
cypress/screenshots
cypress/videos
cypress/results
logs
```

### Packages
Create initial `package.json` file.
```
npm init -y
```
Using https://github.com/cypress-io/cypress
```
npm install cypress --save-dev
```

#### XML
Using the [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) based on most [downloads](https://npmtrends.com/fast-xml-parser-vs-xml-js-vs-xml-to-json-vs-xml2js-vs-xml2json).

Install:
```
npm install xml2js
```

Build:
```
var xml2js = require('xml2js');
var obj = {name: "Super", Surname: "Man", age: 23};
var builder = new xml2js.Builder();
var xml = builder.buildObject(obj);
```
#### Logs
This is an optional package for logging: https://github.com/archfz/cypress-terminal-report.

```
npm i --save-dev cypress-terminal-report
```

The `cypress.config.js` file require updates:

```
 e2e: {
    // specPattern: "cypress/tests/*.spec.{js,jsx,ts,tsx}",
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
```

And `cypress/support/e2e.js`:
```
require('cypress-terminal-report/src/installLogsCollector')();
```

#### Lint
Use the https://github.com/eslint/eslint eslint package.

```
 npm init @eslint/config
 ```

To execute: `npm run lint`

### Configuration
Use the Cypress App to initially setup.

```
npx cypress open
```

Select `Create new spec` for the initial test spec.

## References

Reporter:
- https://github.com/mochajs/mocha/wiki/Third-party-reporters
- https://mochajs.org/api/tutorial-custom-reporter.html
- https://docs.cypress.io/guides/guides/module-api#cypressrun

XML:
- https://github.com/Leonidas-from-XIV/node-xml2js/blob/master/README.md
- https://github.com/Leonidas-from-XIV/node-xml2js/blob/master/test/builder.test.coffee - Test Examples
- https://github.com/Leonidas-from-XIV/node-xml2js/issues/218#issuecomment-120269851 - CDATA record only generated non-normal text.
- https://github.com/testmoapp/junitxml - Overview of JUnit XML