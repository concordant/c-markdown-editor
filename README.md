# Concordant Markdown Editor

The Concordant markdown editor is a collaborative markdown editor React
component build on top of the MDEditor React component. This initial component
has become collaborative thanks to features provided by the Concordant
platform.

## Setup guide

### Requirements

For the next steps, you will need the following software:
- Make sure you have the latest version of Node.js: [see official installation
  guide](https://nodejs.org/en/download/);
- The project uses the Concordant client library from Concordant private registry: [see
  Usage
section](https://gitlab.inria.fr/concordant/software/c-client/-/blob/master/README.md).

### Install Project dependencies

Go to project root directory and:
```shell
npm install
```

### Configuration

Some parameters are configurable and stored in the file `src/config.json`:
- *serverUrl*: is the url of the c-service that should be used;
- *dbName*: is the name of the database you want to store your content.

### Run the application

Go to project root directory and:
```shell
npm start
```

This will run the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.

### Create production build

Go to project root directory and:
```shell
npm run build
```

This will build the app for production to the `build` folder.  It correctly
bundles React in production mode and optimizes the build for the best
performance.

The build is minified and the filenames include the hashes. Your app is ready
to be deployed!

## Requirements (versions)

Node: v14.15.0+

NPM: v6.14.8+

(Project might work with older Node and NPM versions)
