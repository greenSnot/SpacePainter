"use strict";

// System
let _ = require('lodash');
let fs = require('fs'); 
let gulp = require('gulp');
let yargs = require('yargs');
let uglify = require('gulp-uglify');
let jshint = require('gulp-jshint');
let minify = require('gulp-minify');
let stylish = require('jshint-stylish');
let babel = require('gulp-babel');

// Stream tools
let combiner = require('stream-combiner2')
let es = require('event-stream');
let rename = require('gulp-rename');

// Code mangling tools
let clean_css = require('gulp-clean-css');
let concat = require('gulp-concat');
let htmlmin = require('gulp-htmlmin')
let postcss = require('gulp-postcss');
let cssnext = require('postcss-cssnext');
let browserify = require('browserify');

let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

let options = yargs
  .alias('w', 'watch')
  .alias('d', 'debug')
  .argv;

function taskify_stream(stream) {
  let task = combiner.obj(stream)
  if (options.pedantic) {
    task.on('error', function() {
      console.error(arguments);
      process.exit(1);
    });
  } else {
    // Errors are already printed so we don't need to attach
    // consoles / do console.error in these error handlers
    task.on('error', function() {});
  }
  return task;
}

function browserify_file(file, dest_name, dest, standalone, external) {
  let cfg = {
    debug: options.debug,
  };
  if (standalone) {
    cfg.standalone = standalone;
  }
  let r = browserify(file, cfg)
    .external(external || [])
    .transform('babelify', {
      presets: ['es2015'],
      //sourceMapsAbsolute: true,
      compact: false
    })
    .bundle()
    .pipe(source(dest_name))
    .pipe(buffer());
    //.pipe(minify())

  if (options.debug) {
    return r.pipe(gulp.dest(dest));
  } else {
    return r.pipe(uglify())
      .pipe(gulp.dest(dest));
  }
}

function hint() {
  do_watch('hint');
  return gulp.src(['./js/**/*.js', '!./js/art-template.js'])
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter(stylish));
}

function js() {
  do_watch('js');
  return browserify_file('./js/index.js', 'index.min.js', './build/js');
}

let task_2_files = {
  hint: ['./js/**/*.js'],
  html: ['./*.html'],
  js: ['./js/**/*.js'],
  css: ['./css/*.css'],
  images: ['./images/*.*'],
};

let is_watching = [];
function do_watch(task_name) {
  if (options.watch && !_.includes(is_watching, task_name)) {
    console.log("Now watching " + task_name);
    is_watching.push(task_name);
    gulp.watch(task_2_files[task_name], [task_name]);
  }
}

function css() {
  do_watch('css');

  function make_css_stream(files, concat_name) {
    let s = [];
    s.push(gulp.src(files));
    s.push(postcss([cssnext({browsers: ['> 0.01%', '> 0.01% in CN']})]));
    if (concat_name) {
      s.push(concat(concat_name));
    }

    if (!options.d) {
      s.push(clean_css());
    }

    s.push(rename({suffix: '.min'}));
    s.push(gulp.dest('./build/css'));
    return taskify_stream(s);
  }

  let css_files = [
    './css/index.css',
    './css/loading.css',
    './css/dialog.css',
    './css/notice.css',
    './css/editor.css',
    './css/discovery.css',
    './css/my_works.css',
  ];

  return make_css_stream(css_files, 'index.css');
}

function html() {
  do_watch('html');

  let s = [];
  s.push(gulp.src(['./*.html']));
  s.push(gulp.dest('./build/'));
  return taskify_stream(s);
}

function images() {
  do_watch('images');

  let s = [];
  s.push(gulp.src(['./libs/emoji-images/pngs/*.*', './images/*.*']));
  s.push(gulp.dest('./build/images'));
  return taskify_stream(s);
}

function config() {
  var default_config = require('./config/default.js');
  var local_config = require('./config/local.js');
  var merged = _.extend({}, default_config, local_config);
  fs.writeFileSync('./config/merged.js', 'module.exports = ' + JSON.stringify(merged));
}

gulp.task('config', config);
gulp.task('css', css);
gulp.task('html', html);
gulp.task('images', images);
gulp.task('hint', hint);
gulp.task('js', ['config'], js);

gulp.task('default', ['hint', 'css', 'images', 'js', 'html']);
