let colors = require('colors');
let configManager = require('./libs/configManager');
configManager.detectEnvironment(); // Detect Env.

console.log(('  BCGSC - IPR-Client Build Script'  ).blue.bold);
console.log("=".repeat(50).rainbow);
console.log(("Node Version: " + process.version).green);
console.log(("Build Environment: " + configManager.getEnvironment()).green, '\n');


/*
 * Input & Output file definitions
 *
 * Configuration of specified input and output directories and wildcard for application
 * sources.
 */
let files = {
  // Javascript inputs
  js: {
    // Library files sources from dependancies
    libs: [
      './node_modules/angular/angular.min.js',
      './node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
      './node_modules/angular-material/angular-material.min.js',
      './node_modules/angular-animate/angular-animate.min.js',
      './node_modules/angular-resource/angular-resource.min.js',
      './node_modules/angular-aria/angular-aria.min.js',
      './node_modules/lodash/lodash.js',
      './node_modules/moment/min/moment.min.js',    // Order is important! Moment before Angular Moment
      './node_modules/angular-moment/angular-moment.min.js',
      './node_modules/ngstorage/ngStorage.min.js',
      './node_modules/simplemde/dist/simplemde.min.js',
      './node_modules/svg-pan-zoom/dist/svg-pan-zoom.js',
      './node_modules/angular-file-upload/dist/angular-file-upload.min.js',
      './node_modules/angular-sanitize/angular-sanitize.min.js',
      './node_modules/angular-sortable-view/src/angular-sortable-view.js',
      './node_modules/quill/dist/quill.min.js',
      './node_modules/ng-quill/dist/ng-quill.min.js',
      './node_modules/chart.js/dist/Chart.min.js',
      './node_modules/angular-chart.js/dist/angular-chart.min.js',
      './node_modules/angular-socket-io/socket.min.js',
      './node_modules/angular-messages/angular-messages.js',
      './node_modules/keycloak-js/dist/keycloak.min.js',
    ],
    
    // Application javascript sources
    app: [
      './src/app.js',
      './src/libs/*.js',
      './src/filters/*.js',
      './src/api/**/*.js',
      './src/services/*.js',
      './src/directives/**/*.js',
      './src/config/*.js',
      './src/components/**/*.js',
    ]
  },
  
  // Template files to be compiled into HTML
  pug: {
    index: ['./src/index.pug'],
    templates: ['./src/components/**/*.pug', './src/directives/**/*.pug']
  },
  
  // Static image assets to be processed
  images: {
    // Static app-wide images
    app: [
      './src/statics/**/*.png',
      './src/statics/**/*.jpg',
      './src/statics/**/*.jpeg',
      './src/statics/**/*.gif',
      './src/statics/**/*.svg'
    ],
    
    // Component specific files
    components: [
      './src/components/**/*.png',
      './src/components/**/*.jpg',
      './src/components/**/*.svg',
    ]
  },

  // JSON DBs
  jsonDB: [
    './src/statics/**/*.json'
  ],
  
  // Stylesheet sources
  scss: {
    app: ['./src/styles/style.scss', './src/styles/ie.scss'],                             // Application wide
    components: ['./src/directives/**/*.scss', './src/components/**/*.scss'],             // Component specific
    libs: [
      './src/styles/libs.scss',
      './node_modules/simplemde/dist/simplemde.min.css',
      './node_modules/quill/dist/quill.bubble.css',
      './node_modules/quill/dist/quill.snow.css'
    ],  // Library sources
  },
  
  // Output locations for generated files
  public: [
    './builds/'+configManager.getEnvironment()+'/**/*.html',
    './builds/'+configManager.getEnvironment()+'/assets/*.js',
    './builds/'+configManager.getEnvironment()+'/assets/*.css',
    './builds/'+configManager.getEnvironment()+'/assets/**/*.css',
    './builds/'+configManager.getEnvironment()+'/assets/templates.js'
  ]
};

const gulp = require('gulp');
const fs = require('fs');
const connect = require('gulp-connect');
const modRewrite = require('connect-modrewrite');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const log = require('fancy-log');
const template = require('gulp-angular-templatecache');
const cleanCSS = require('gulp-clean-css');
const pug = require('gulp-pug');
const babel = require('gulp-babel');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const gulpStylelint = require('gulp-stylelint');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');

// Gulp task to clean/empty out builds directory 
gulp.task('clean', () => {
  return del(['./builds/'+configManager.getEnvironment()]);
});


const env = configManager.detectEnvironment();

gulp.task('config', () => {
  configManager.loadConfig();
  if (!fs.existsSync('./builds')) fs.mkdirSync('./builds/');
  if (!fs.existsSync('./builds/'+configManager.getEnvironment())) fs.mkdirSync('./builds/'+configManager.getEnvironment());
  if (!fs.existsSync('./builds/'+configManager.getEnvironment()+'/assets')) fs.mkdirSync('./builds/'+configManager.getEnvironment()+'/assets');

  // Write Config
  configManager.writeConfig();

  return true;
});


/*
 * Compile App JS
 *
 * Collect all application specific JS. Pass through ES2015 Babel
 * filtering for backwards compatibility. Concat into single output
 * Uglify if in production mode.
 *
 */
gulp.task('js', () => {
  return gulp.src(files.js.app)
    .pipe(plumber())
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/js'))
    .pipe(connect.reload());
});

/*
 * Compile Libs JS
 *
 * Collect all application specific JS. Concat into single output.
 * Uglify if in production
 *
 */
gulp.task('libs', () => {
  return gulp.src(files.js.libs)
    .pipe(plumber())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(`./builds/${configManager.getEnvironment()}/assets/libs`));
});

/*
 * Compile Pug Index
 *
 * Fetch, and compile pug index file
 *
 */
gulp.task('pug-index', () => {
  return gulp.src(files.pug.index)
    .pipe(plumber())
    .pipe(pug().on('error', log.error))
    .pipe(gulp.dest(`./builds/${configManager.getEnvironment()}`))
    .pipe(connect.reload());
});

/*
 * Compile Pug Components
 *
 * Collect, and compile pug files. Convert into angular
 * cache templates, and save to templates.js file.
 *
 */
gulp.task('pug-templates', () => {
  return gulp.src(files.pug.templates)
    .pipe(plumber())
    .pipe(pug().on('error', log.error))
    .pipe(template('templates.js', { standalone: true }).on('error', log.error))
    .pipe(gulp.dest(`./builds/${configManager.getEnvironment()}/assets/js`))
    .pipe(connect.reload());
});


/*
 * Compile Components SCSS
 *
 * Collect, compile, and clean SASS style sources
 *
 */
gulp.task('sass-components', () => {
  return gulp.src(files.scss.components)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(sass()).on('error', log.error)
    .pipe(autoprefixer())
    .pipe(concat('components.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/styles'))
    .pipe(connect.reload());
});

/*
 * Compile App SCSS
 *
 * Collect, compile, and clean SASS style sources
 *
 */
gulp.task('sass-app', () => {
  return gulp.src(files.scss.app)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(sass()).on('error', log.error)
    .pipe(autoprefixer())
    .pipe(concat('app.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/styles'))
    .pipe(connect.reload());
});

/*
 * Compile Library SCSS
 *
 * Collect, compile, and clean SASS style sources
 *
 */
gulp.task('sass-libs', () => {
  return gulp.src(files.scss.libs)
    .pipe(plumber())
    .pipe(sass()).on('error', log.error)
    .pipe(autoprefixer())
    .pipe(concat('libs.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/libs'));
});


/*
 * Application Static Images
 *
 * Collect application static image files, and copy.
 *
 */
gulp.task('images-app', () => {
  return gulp.src(files.images.app)
    .pipe(plumber())
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/images'));
});

/*
 * Application Static JSON DBs
 *
 * Collect application static json DB files and copy
 *
 */
gulp.task('json-db', () => {
  return gulp.src(files.jsonDB)
    .pipe(plumber())
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()+'/assets/json'));
});

/*
 * Favicon Process
 *
 * Move Favicon
 *
 */
gulp.task('favicon', () => {
  return gulp.src('./src/statics/favicon.ico')
    .pipe(plumber())
    .pipe(gulp.dest('./builds/'+configManager.getEnvironment()));
});

/*
 * Development Watch
 *
 * Watch files for changes and reload
 *
 */
gulp.task('watch', () => {
  gulp.watch(files.pug.index, ['pug-index']);
  gulp.watch(files.pug.templates, ['pug-templates']);
  gulp.watch(files.scss.app, ['sass-app']);
  gulp.watch(files.scss.components, ['sass-components']);
  gulp.watch(files.js.app, ['js']);
});

/*
 * Development Server
 *
 * Start basic development server
 *
 */
gulp.task('connect', () => {

  return connect.server({
    middleware: () => {
      return [modRewrite(['^[^.]*$ /index.html'])];
    },
    livereload: configManager.getConfig().CONNECT.LIVE_RELOAD || false,
    root: ['builds/'+configManager.getEnvironment()],
    host: '0.0.0.0',
    port: configManager.getConfig().CONNECT.PORT || 3000
  });
});

gulp.task('images', ['images-app']);
gulp.task('json', ['json-db']);
gulp.task('pug', ['pug-index', 'pug-templates']);
gulp.task('sass', ['sass-app', 'sass-libs', 'sass-components']);
gulp.task('build', ['favicon', 'config', 'pug', 'libs', 'js', 'sass', 'images', 'json']);
gulp.task('deploy-build', () => { runSequence('clean', 'build'); });
/*
 * Default Gulp Task
 *
 * Remove old build, build new, and start dev server
 *
 */
gulp.task('default', () => {
  runSequence(
    'clean',
    'build',
    ['watch', 'connect'],
  );
});


/*
 * Default Gulp Task
 *
 * Remove old build, build new, and start dev server
 *
 */
gulp.task('host', () => {
  runSequence(
    'clean',
    'build',
    'connect',
  );
});
