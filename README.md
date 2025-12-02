# Integrated Pipeline Reports (IPR) Client

![Build Status](https://www.bcgsc.ca/bamboo/plugins/servlet/wittified/build-status/PORI-IPRCLI) ![build](https://github.com/bcgsc/pori_ipr_client/workflows/build/badge.svg?branch=master) ![node versions](https://img.shields.io/badge/node-12%20%7C%2014%20%7C%2016-blue) [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.5728424.svg)](https://doi.org/10.5281/zenodo.5728424)


## Table of Contents

* [Running the client](#running-the-client)
* [Project structure](#project-structure)
* [Resources](#resources)
* [Contributing](#contributing)

IPR is part of the [platform for oncogenomic reporting and interpretation](https://github.com/bcgsc/pori).

The IPR client is designed to consume API data from IPR's API. The primary function is the production and management of various reports.

This project only includes the report functionality. Tracking and biopsy input are available in the IPR-Tracking application.

The client utilizes the React web framework. The UI library used is Material-UI (MUI) for React.

## Running the Client

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

## Project Structure

The app directory contains all of the application logic.

* `components` - Common components used across the application
* `views` - Page views which can be routed to
* `services` - React helper modules
* `styles` - General style related files and variables
* `statics` - Files and images not expected to change
* `utils` - Short helper functions
* `hooks` - Custom React hooks
* `context` - React contexts

## Resources

A demo site is available at https://pori-demo.bcgsc.ca

## Contributing

Contributions are welcome! Before doing so, please open an issue with the feature that would be added.
In addition, make sure that the code that is being added is linted using the rules in our .eslintrc file.

## Compatibility Matrix

| IPR Client | IPR API | GraphKB API |
|------------|---------|-------------|
| v7.2.0     | ~v8.3.0 | ~v3.16.0    |
| v7.1.2     | ~v8.2.0 | ~v3.16.0    |
| v7.1.1     | ~v8.2.0 | ~v3.15.0    |
| v7.1.0     | ~v8.2.0 | ~v3.15.0    |
| v7.0.2     | ~v8.1.0 | ~v3.15.0    |
| v7.0.1     | ~v8.1.0 | ~v3.15.0    |
| v7.0.0     | ~v8.1.0 | ~v3.15.0    |