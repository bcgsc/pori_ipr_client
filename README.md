### IPR Client

![Build Status](https://www.bcgsc.ca/bamboo/plugins/servlet/wittified/build-status/IPR-DEVCLIENT)

The Integrated Pipeline Reports (IPR) client is designed to consume API data from IPR's API, as well as
other BC GSC BioFX APIs. The primary function is the production and management of POG Genomic and Targeted Gene reports.

IPR has grown to include Biopsy and sample tracking for POG as well as Knowledgebase. All of these functions are
plugged in to a central dashboard framework that allows users to seamlessly switch off between tasks. 

The client utilized AngularJS 1.6 web framework. The routing is handled by the ui-router module, and the UI library 
is AngularJS Material.


#### Application Structure

The client is built from source using the Gulp task manager. The tasks are defined in the `gulpfile.js` in the
repository root directory. Inside `gulpfile.js` the tasks are described and execute co-linearly.

Tasks:
* `clean` - Removes any previous build directory files 
* `favicon` - Copies the favicon file into the build directory
* `config` - Runs a series of functions to determine the current build environment, and loads configuration
files accordingly.
* `pug` - Parent task for all pug related tasks:
 * `pug-index` - Renders the index.pug source file into the index.html file and copies it to the build directory
 * `pug-templates` - Globs all .pug files in the source directory, compiles them into HTML and places them as strings 
 in the `templates.js` folder. These strings are called and interpreted by AngularJS when required by the client.
* `sass` - Parent task for all SASS/css tasks:
 * `sass-app` - Renders all SASS rules for global application styles into a minified css file
 * `sass-libs` - Renders required library SASS files into a minified css file
 * `sass-components` - Renders application component SASS files into a minified css file
* `libs` - Concats, uglifies and minifies application library JS files into a single library JS file
* `js` - Concats, uglifies and minifies all application JS files
* `images` - Copies all images from the src directory to the build statics directory
* `json` - Copies all necessary static json files to the build directory

#### Building the client

The client must be built via gulp before it can be run locally or deployed. Builds are environment dependent. 
Different configurations are used based on if the environment is: local, development, testing, or production. 

Local environment will map API's to the machine's IP address and is meant to be used in parallel with a locally 
running API server. After starting, the local web server will watch for changes on any files in the src and rebuild
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

After all the dependencies have been brought installed, it is recommended for ease of use to install `gulp` globally
on your account:
```
npm install -g gulp
```

Once this is done, to build a development version of the client, simply run:
```
gulp
```

And the client should build, and initialize a local server on port 3000 for you to access and work with:
```
  BCGSC - IPR-Client Build Script 1.3.0
==================================================
Node Version: v6.11.2
Build Environment: local

[09:12:50] Using gulpfile ~/projects/development/ipr-client/gulpfile.js
[09:12:50] Starting 'default'...
[09:12:50] Starting 'clean'...
[09:12:50] Finished 'default' after 5.31 ms
[09:12:50] Finished 'clean' after 640 ms
[09:12:50] Starting 'favicon'...
[09:12:50] Starting 'config'...
[09:12:50] Finished 'config' after 26 ms
[09:12:50] Starting 'pug-index'...
[09:12:50] Starting 'pug-templates'...
[09:12:50] Starting 'libs'...
[09:12:50] Starting 'js'...
[09:12:50] Starting 'sass-app'...
[09:12:50] Starting 'sass-libs'...
[09:12:50] Starting 'sass-components'...
[09:12:50] Starting 'images-app'...
[09:12:50] Starting 'json-db'...
[09:12:57] Finished 'favicon' after 6.32 s
[09:12:57] Finished 'pug-index' after 6.29 s
[09:12:57] Finished 'json-db' after 6.25 s
[09:12:57] Starting 'json'...
[09:12:57] Finished 'json' after 9.25 μs
[09:12:58] Finished 'sass-libs' after 8.16 s
[09:12:59] Finished 'sass-app' after 8.97 s
[09:13:01] Finished 'images-app' after 11 s
[09:13:01] Starting 'images'...
[09:13:01] Finished 'images' after 4.06 μs
[09:13:04] Finished 'libs' after 13 s
[09:13:09] Finished 'sass-components' after 19 s
[09:13:09] Starting 'sass'...
[09:13:09] Finished 'sass' after 2.51 μs
[09:13:17] Finished 'pug-templates' after 26 s
[09:13:17] Starting 'pug'...
[09:13:17] Finished 'pug' after 3.9 μs
[09:13:19] Finished 'js' after 28 s
[09:13:19] Starting 'build'...
[09:13:19] Finished 'build' after 2.42 μs
[09:13:19] Starting 'watch'...
[09:13:19] Finished 'watch' after 842 ms
[09:13:19] Starting 'connect'...
[09:13:20] Finished 'connect' after 741 ms
[09:13:20] Server started http://0.0.0.0:3000
```

Other build options include `gulp deploy-build`. This will create the static files in the build directory, but not
launch the local dev server.

To force the environment you want, preface the gulp command:
```
NODE_ENV=[local|development|test|production] gulp
```

#### Running tests with Cypress

End to end tests are run using Cypress and written with Mocha + Chai.

A file named `.auth.json` is required at the project's root directory containing the following structure:

```
{
  "admin": {
    "username": ____,
    "password": ____
  },
  "test" {
    "username": ____,
    "password": ____
}
```
Where `admin` is your regular user account and `test` is the user account ending in -ipr. Ex: jdavies-ipr

The account is chosen based on what the access environment variable is set to in cypress.json. Default is `admin`.

Assuming the tests are to be run locally, install build dependencies then start a local instance of IPR.
Run the command `npm run cypress:open` to start Cypress. From there, click the spec file you wish to run.


#### Source Structure

The main source directory contains all of the application logic, templates, and static files.

* `api` - All application plugin interface definitions
* `components` - The bulk of the client is contained within components.
  * `dashboard` - Protected behind login authentication, each section/module of the application is located within
dashboard.
  * `errors` - The error pages displayed when triggered by 404, 500 errors.
  * `print` - The print template sections for POG reports
  * `public` - The public pages that are visible for visitors that are not logged in.
* `config` - AngularJS configuration files and route definitions/mappings
* `directives` - AngularJS directives used throughout the applications (see AngularJS documentation for details)
* `filters` - AngularJS filters
* `libs` - None used currently
* `services` - AngularJS services that can be called from controllers. General purpose functions.
* `statics` - Static files containing no logic used by the application (images, etc.)
* `styles` - Application wide stylesheets (sass files)
* `app.js` - The main AngularJS application boot file
* `index.pug` - The main application index.html file that the browser loads, triggering init of application.