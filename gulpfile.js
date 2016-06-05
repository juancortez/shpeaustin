// Include gulp
var gulp = require('gulp'); 
// Include Our Plugins
var plugins = require('gulp-load-plugins')();

var all_javascripts = "public/javascripts/*.js",
    javascript_src = "public/javascripts/",
    javascript_dest = "public/dist";

var utils_src = "public/javascripts/utils/";

var all_stylesheets = "public/stylesheets/*.css",
    less_stylesheets = "public/stylesheets/less/*.less",
    stylesheet_src = "public/stylesheets/",
    stylesheet_dest = "public/dist";

var all_html = "views/*.html";
var all_ejs = "views/*.ejs";

var all_json = "metadata/*.json";

// Lint Task
// Checks any javascript file in our js/ directory and makes sure there are no
// syntax errors in our code
gulp.task('lint', function() {
    return gulp.src(all_javascripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
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
        .pipe(plugins.concat('index.js'))
        .pipe(plugins.rename('index.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('membership_script', function() {
    return gulp.src(javascript_src+"membership.js")
        .pipe(plugins.concat('membership.js'))
        .pipe(plugins.rename('membership.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('contact_script', function() {
    return gulp.src(javascript_src+"contact.js")
        .pipe(plugins.concat('contact.js'))
        .pipe(plugins.rename('contact.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('ajaxUtils_script', function() {
    return gulp.src(utils_src+"ajaxUtils.js")
        .pipe(plugins.concat('ajaxUtils.js'))
        .pipe(plugins.rename('ajaxUtils.min.js'))
        .pipe(plugins.uglify())
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
        // .pipe(plugins.uncss({
        //     html: [all_html, all_ejs] // throws an error for jQuery - wait for bug fix
        // }))
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(stylesheet_dest));
});

// a LESS plugin for node.js
gulp.task('less', function () {
  var path = require('path');
  return gulp.src(less_stylesheets)
    .pipe(plugins.less({
      paths: [path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest(stylesheet_src));
});


// shows errors on HTML 
// NOTE: doesn't work very well with EJS <% %> tags
gulp.task('check_html', function() {
    return gulp.src(all_html)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter())
});

// Checks that all metadata inside of the /metadata folder is valid JSON
gulp.task('json_lint', function() {
    return gulp.src(all_json)
        .pipe(plugins.jsonlint())
        .pipe(plugins.jsonlint.reporter(
            function(file){
                console.log('File ' + file.path + ' is not valid JSON.');
            })
        );
});

// Watch Files For Changes
// The watch task is used to run tasks as we make changes to our files. As 
// you write code and modify your files, the gulp.watch() method will listen 
// for changes and automatically run our tasks again so we don't have to 
// continuously jump back to our command-line and run the gulp command each time.
gulp.task('watch', function() {
    gulp.watch(all_javascripts, ['lint', 'index_script', 'membership_script', 'contact_script']);
    gulp.watch(utils_src, ['ajaxUtils_script']);
    gulp.watch(all_stylesheets, ['less', 'autoprefixer']);
    gulp.watch(less_stylesheets, ['less', 'autoprefixer']);
    gulp.watch(all_json, ['json_lint']);
    //gulp.watch('scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'index_script', 'membership_script', 'contact_script', 'ajaxUtils_script', 'less', 'autoprefixer', 'json_lint', 'watch']);