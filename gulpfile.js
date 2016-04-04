// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');
//var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var all_javascripts = "public/javascripts/*.js";
var javascript_src = "public/javascripts/";
var javascript_dest = "public/dist";

var all_stylesheets = "public/stylesheets/*.css";
var stylesheet_src = "public/stylesheets/";
var stylesheet_dest = "public/dist";

// Lint Task
// Checks any javascript file in our js/ directory and makes sure there are no
// syntax errors in our code
gulp.task('lint', function() {
    return gulp.src(all_javascripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
// The sass task compiles any of our Sass files in our scss/ directory into 
// .css and saves the compiled .css file in our css/ directory.
// gulp.task('sass', function() {
//     return gulp.src('scss/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('css'));
// });

// Concatenate & Minify JS
// The scripts task concatenates all JavaScript files in our js/ directory 
// and saves the ouput to our dist/ directory. Then gulp takes that concatenated 
// file, minifies it, renames it and saves it to the dist/ directory alongside 
// the concatenated file.
gulp.task('index_script', function() {
    return gulp.src(javascript_src+"index.js")
        .pipe(concat('index.js'))
        .pipe(rename('index.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('membership_script', function() {
    return gulp.src(javascript_src+"membership.js")
        .pipe(concat('membership.js'))
        .pipe(rename('membership.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('contact_script', function() {
    return gulp.src(javascript_src+"contact.js")
        .pipe(concat('contact.js'))
        .pipe(rename('contact.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(javascript_dest));
});


// PostCSS plugin to parse CSS and add vendor prefixes to CSS rules using values from Can I Use. 
// It is recommended by Google and used in Twitter, and Taobao.
gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');

    return gulp.src(all_stylesheets)
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(stylesheet_dest));
});

// Watch Files For Changes
// The watch task is used to run tasks as we make changes to our files. As 
// you write code and modify your files, the gulp.watch() method will listen 
// for changes and automatically run our tasks again so we don't have to 
// continuously jump back to our command-line and run the gulp command each time.
gulp.task('watch', function() {
    gulp.watch(all_javascripts, ['lint', 'index_script', 'membership_script', 'contact_script', 'autoprefixer']);
    //gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'index_script', 'membership_script', 'contact_script', 'autoprefixer', 'watch']);