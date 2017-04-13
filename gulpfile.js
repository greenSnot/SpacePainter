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
var less = require('gulp-less');
var path = require('path');
var template = require('gulp-templatex');

// Stream tools
let combiner = require('stream-combiner2');
let es = require('event-stream');
let rename = require('gulp-rename');

// Code mangling tools
let clean_css = require('gulp-clean-css');
let concat = require('gulp-concat');
let htmlmin = require('gulp-htmlmin');
let postcss = require('gulp-postcss');
let cssnext = require('postcss-cssnext');
let browserify = require('browserify');

let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

let options = yargs
  .alias('w', 'watch')
  .alias('d', 'debug')
  .argv;

var template_data = {
  js_version: 1,
  css_version: 1,
};

function taskify_stream(stream) {
  let task = combiner.obj(stream);
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
  html: ['./*.html', './html/**/*'],
  js: ['./js/**/*.js'],
  css: ['./css/*.less'],
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
    s.push(gulp.src(files)
      .pipe(less({
        paths: [path.join(__dirname)]
      })));

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
    './css/index.less',
    './css/loading.less',
    './css/dialog.less',
    './css/notice.less',
    './css/editor.less',
    './css/discovery.less',
    './css/my_works.less',
  ];

  return make_css_stream(css_files, 'index.css');
}

function html() {
  do_watch('html');

  let s = [];
  template_data.js_version = Date.now();
  template_data.css_version = Date.now();
  s.push(gulp.src(['./*.html']).pipe(template(template_data, {dirname: __dirname})));
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

function font() {
  let s = [];
  s.push(gulp.src('./node_modules/font-awesome/fonts/*'));
  s.push(gulp.dest('./build/fonts'));
  return taskify_stream(s);
}

gulp.task('config', config);
gulp.task('css', ['html'], css);
gulp.task('html', html);
gulp.task('images', images);
gulp.task('hint', hint);
gulp.task('js', ['config', 'html'], js);
gulp.task('font', font);

gulp.task('default', ['hint', 'css', 'images', 'js', 'font']);
