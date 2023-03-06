# Cypress Testspace Reporter
This is a prototype/sandbox to learn the reporter requirement specifics.

## Usage
To use the reporter:

```
npx cypress run --reporter src/testspace-reporter.js
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

### Configuration
Use the Cypress App to initially setup.

```
npx cypress open
```

Select `Create new spec` for the initial test spec.
