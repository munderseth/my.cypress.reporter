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

### Configuration
Use the Cypress App to initially setup.

```
npx cypress open
```

Select `Create new spec` for the initial test spec.
