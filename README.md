# IPR Client

![Build Status](https://www.bcgsc.ca/bamboo/plugins/servlet/wittified/build-status/IPR-IPRWP117) ![build](https://github.com/bcgsc/pori_ipr_client/workflows/build/badge.svg?branch=master) ![node versions](https://img.shields.io/badge/node-10%20%7C%2012%20%7C%2014-blue)

The Integrated Pipeline Reports (IPR) client is designed to consume API data from IPR's API, as well as
LIMS and Bioapps APIs. The primary function is the production and management of POG Genomic and Targeted Gene reports.

This project only includes the report functionality. Tracking and biopsy input are available in the IPR-Tracking application.

The client utilizes AngularJS 1.7 web framework at the top level with React components nested using react2angular. The routing is handled by the ui-router module, and the UI library is AngularJS Material for AngularJS components and Material-UI for React components.

## Running the client

Before running the client, the npm dependencies need to be installed:

```Bash
npm install
```

A dev version of the client can be run using:

```Bash
npm start
```

Dev in the above example can also be replaced by local or prod to run againt those APIs (local would be your own API instance).

Local environment will map API's to the machine's IP address and is meant to be used in parallel with a locally
running API server. After starting, the local web server will watch for changes on any files in the app and rebuild
the affected areas, then trigger the client (if open in browser) to reload.

The development environment maps API calls to the iprdev-api.bcgsc.ca API server that uses the separate development
database. This client is built automatically by the Bamboo CI server upon merging or committing/pushing to development
branch on the Bitbucket server.

The production environment maps API calls to the ipr-api.bcgsc.ca API server and uses the production database. This
is built automatically by the Bamboo CI upon approving a PR merge onto the production branch.

Other build options include `npm run build`. This will create the static files in the dist directory, but not
launch the local dev server.

## Source Structure

The main app directory contains all of the application logic and templates.

* `components` - Common components used across the application
* `views` - Page views which can be routed to
* `services` - AngularJS/React API calls which can be injected into the application
* `styles` - General style related files and variables
* `filters` - AngularJS filters used in pug files
* `statics` - Files and images not expected to change

## Angular Caveats

There's still parts of angular throughout the app (components, some views).
Root.module registers these angular parts and then bootstraps react. The components imported using default imports
are pure AngularJS, meant to be used within react converted angular components (using angular2react).
