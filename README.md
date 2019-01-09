### IPR Client

![Build Status](https://www.bcgsc.ca/bamboo/plugins/servlet/wittified/build-status/IPR-DEVCLIENT)

The Integrated Pipeline Reports (IPR) client is designed to consume API data from IPR's API, as well as
LIMS and Bioapps APIs. The primary function is the production and management of POG Genomic and Targeted Gene reports.

IPR has grown to include Biopsy and sample tracking for POG as well as Knowledgebase. All of these functions are
plugged in to a central dashboard framework that allows users to seamlessly switch off between tasks. 

The client utilizes AngularJS 1.7 web framework. The routing is handled by the ui-router module, and the UI library 
is AngularJS Material.


#### Building the client

The client must be built via gulp before it can be run locally or deployed. Builds are environment dependent. 
Different configurations are used based on if the environment is: local, development, testing, or production. 

Local environment will map API's to the machine's IP address and is meant to be used in parallel with a locally 
running API server. After starting, the local web server will watch for changes on any files in the app and rebuild
the affected areas, then trigger the client (if open in browser) to reload.

The development environment maps API calls to the dev-ipr.bcgsc.ca:8081 API server that uses the separate development
database. This client is built automatically by the Bamboo CI server upon merging or committing/pushing to development
branch on the Bitbucket server. 

The production environment maps API calls to the ipr.bcgsc.ca:8001 API server and uses the production database. This 
is built automatically by the Bamboo CI upon approving a PR merge onto the production branch.

Before building the client, the npm dependencies need to be installed:
```
npm install
```

Once this is done, to build a local version of the client, simply run:
```
npm run start:local
```
NOTE: IPR-API is expected to be running locally as well when using this env.

Other build options include `npm run build`. This will create the static files in the dist directory, but not
launch the local dev server.

To choose the environment you want, end the npm run start command with the env:
```
npm run start:env
npm run start:production
```

#### Running tests with Cypress

End to end tests are run using Cypress and written with Mocha + Chai.

Exported variables are needed to run the tests. If you are storing `CYPRESS_PASSWORD` in a bash_profile file,
run `chmod 600 ~/.bash_profile` to make it only available for yourself. Required variables to run all tests are:

```
CYPRESS_ADMIN  ex. jdavies
CYPRESS_TEST  ex. jdavies-ipr
CYPRESS_PASSWORD
```

Assuming the tests are to be run locally, install build dependencies then start a local instance of IPR with `NODE_ENV=local gulp`.
Run the command `npm run cypress:open` to start Cypress. From there, click the spec file you wish to run.


#### Source Structure

The main app directory contains all of the application logic and templates.

* `common` - Common components used across the application
* `components` - Components used as pages
* `services` - AngularJS services which can be injected into the application. Used for API calls
* `styles` - General style related files