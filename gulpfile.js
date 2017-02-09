let colors = require('colors');
let scriptVer = '1.0.0';

console.log(('  BCGSC - IPR-Client Build Script '+ scriptVer +'  ').blue.bold.bgWhite);
console.log("=".repeat(50).dim);
console.log(("Node Version: " + process.version).yellow, '\n');

/*
 * Gulp Configuration
 *
 * Basic setup and configuration for builds of application
 *
 */
let config = {
  env: {
    dev: true,
    test: false,
    production: false
  }
}

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
      './node_modules/angular-ui-router/release/angular-ui-router.min.js',
      './node_modules/angular-material/angular-material.min.js',
      './node_modules/angular-animate/angular-animate.min.js',
      './node_modules/angular-resource/angular-resource.min.js',
      './node_modules/angular-aria/angular-aria.min.js',
      './node_modules/lodash/lodash.js',
      './node_modules/moment/min/moment.min.js',    // Order is important! Moment before Angular Moment
      './node_modules/angular-moment/angular-moment.min.js',
      './node_modules/ng-storage/ngStorage.min.js',
      './node_modules/angular-breadcrumb/dist/angular-breadcrumb.min.js',
      './node_modules/angular-ui-router-breadcrumbs/dist/angular-ui-router-breadcrumbs.min.js',
      './node_modules/simplemde/dist/simplemde.min.js',
      './node_modules/marked/marked.min.js',
      './node_modules/angular-marked/dist/angular-marked.min.js',
      './node_modules/svg-pan-zoom/dist/svg-pan-zoom.js',
      './node_modules/angular-sticky-plugin/dist/angular-sticky.min.js'
    ],
    
    // Application javascript sources
    app: [
      './src/app.js',
      './src/libs/*.js',
      './src/api/**/*.js',
      './src/services/*.js',
      './src/directives/**/*.js',
      './src/components/**/*.js',
      './src/config/*.js',
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
  
  // Stylesheet sources
  scss: {
    app: ['./src/styles/style.scss', './src/styles/ie.scss'],                 // Application wide
    components: ['./src/directives/**/*.scss', './src/components/**/*.scss'], // Component specific
    libs: ['./src/styles/libs.scss']                                          // Library sources
  },
  
  // Output locations for generated files
  public: [
    './builds/**/*.html',
    './builds/assets/*.js',
    './builds/assets/*.css',
    './builds/assets/**/*.css',
    './builds/assets/templates.js'
  ]
};

let gulp = require('gulp'),
    connect = require('gulp-connect'),
    modRewrite = require('connect-modrewrite'),
    gzip = require('connect-gzip'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    image = require('gulp-imagemin'),
    gutil = require('gulp-util'),
    template = require('gulp-angular-templatecache'),
    livereload = require('gulp-livereload'),
    If = require('gulp-if'),
    cleanCSS = require('gulp-clean-css'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel')
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    pako = require('gulp-pako'),
    runSequence = require('run-sequence'),
    gulpStylelint = require('gulp-stylelint');

// Gulp task to clean/empty out builds directory 
gulp.task('clean', () => {
  return del(['./builds']);
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
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(If(config.env.production, uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/assets/js'))
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
    .pipe(concat('libs.js'))
    .pipe(If(config.env.production, uglify()))
    //.pipe(pako.gzip())
    .pipe(gulp.dest('./builds/assets/libs'));
});

gulp.task('compileASN1', () => {
  return gulp.src('./node_modules/asn1js/src/asn1.js')
    .pipe(babel())
    .pipe(concat('asn1.js'))
    .pipe(gulp.dest('./src/libs/'));
});

/*
 * Compile Pug Index
 *
 * Fetch, and compile pug index file
 *
 */
gulp.task('pug-index', () => {
  return gulp.src(files.pug.index)
    .pipe(pug().on('error', gutil.log))
    .pipe(gulp.dest('./builds'))
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
    .pipe(pug().on('error', gutil.log))
    .pipe(template('templates.js', {standalone: true}).on('error', gutil.log))
    .pipe(If(config.env.production, uglify()))
    .pipe(gulp.dest('./builds/assets/js'))
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
    .pipe(sourcemaps.init())
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(sass()).on('error', gutil.log)
    .pipe(autoprefixer())
    .pipe(concat('components.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/assets/styles'))
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
    .pipe(sourcemaps.init())
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(sass()).on('error', gutil.log)
    .pipe(autoprefixer())
    .pipe(concat('app.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./builds/assets/styles'))
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
    .pipe(sass()).on('error', gutil.log)
    .pipe(autoprefixer())
    .pipe(concat('libs.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./builds/assets/libs'));
});


/*
 * Application Static Images
 *
 * Collect application static image files, and copy.
 *
 */
gulp.task('images-app', () => {
  
  return gulp.src(files.images.app)
    .pipe(gulp.dest('./builds/assets/images'));
});

/*
 * Favicon Process
 *
 * Move Favicon
 *
 */
gulp.task('favicon', function () {
    return gulp.src('./src/statics/favicon.ico')
        .pipe(gulp.dest('./builds/'));
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
      let middlewares = [modRewrite(['^[^.]*$ /index.html'])];
      return middlewares;
    },
    livereload: true,
    root: ['builds'],
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  });
});

gulp.task('images', ['images-app']);
gulp.task('pug', ['pug-index','pug-templates']);
gulp.task('sass', ['sass-app','sass-libs','sass-components']);
gulp.task('build', ['favicon', 'pug','libs','js','sass', 'images']);

//gulp.task('run', runSequence('favicon','pug', 'js', 'sass-app', 'sass-components',['watch', 'connect']));
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
    ['watch', 'connect']
  );
});


