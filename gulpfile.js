// Include gulp
const gulp = require('gulp');
// Include Our Plugins
const plugins = require('gulp-load-plugins')();

const all_javascripts = "public/javascripts/*.js",
    javascript_src = "public/javascripts/",
    javascript_dest = "public/dist";

const all_utils_src = "public/javascripts/utils/*";

const all_stylesheets = "public/stylesheets/*.css",
    less_stylesheets = "public/stylesheets/less/*.less",
    stylesheet_src = "public/stylesheets/",
    stylesheet_dest = "public/dist";

const all_html = "views/*.html";
const all_ejs = "views/*.ejs";

const all_json = "metadata/*.json";

`
    Lint Task
    Checks any javascript file in our js/ directory and makes sure there are no
        
`
gulp.task('lint', () => {
    return gulp.src(all_javascripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

`
    Concatenate & Minify JS
    The scripts task concatenates all JavaScript files in our js/ directory 
    and saves the ouput to our dist/ directory. Then gulp takes that concatenated 
    file, minifies it, renames it and saves it to the dist/ directory alongside 
    the concatenated file.
`
gulp.task('index_script', () => {
    return gulp.src([javascript_src + "index.js", all_utils_src + "ajaxUtils.js", all_utils_src + "modal.js"])
        .pipe(plugins.concat('index.js'))
        .pipe(plugins.rename('index.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('membership_script', () => {
    return gulp.src([javascript_src + "membership.js", all_utils_src + "modal.js", all_utils_src + "calendar.js"])
        .pipe(plugins.concat('membership.js'))
        .pipe(plugins.rename('membership.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('contact_script', () => {
    return gulp.src([javascript_src + "contact.js", all_utils_src + "chat.js"])
        .pipe(plugins.concat('contact.js'))
        .pipe(plugins.rename('contact.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});

gulp.task('admin_script', () => {
    return gulp.src(javascript_src + "admin.js")
        .pipe(plugins.concat('admin.js'))
        .pipe(plugins.rename('admin.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
});
`
    PostCSS plugin to parse CSS and add vendor prefixes to CSS rules using values from Can I Use. 
    It is recommended by Google and used in Twitter, and Taobao.
`
gulp.task('autoprefixer', () => {
    const postcss = require('gulp-postcss'),
        sourcemaps = require('gulp-sourcemaps'),
        autoprefixer = require('autoprefixer');

    return gulp.src(all_stylesheets)
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer({
            browsers: ['last 2 versions']
        })]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(stylesheet_dest));
});

`
    a LESS plugin for node.js
`
gulp.task('less', () => {
    const path = require('path');
    return gulp.src(less_stylesheets)
        .pipe(plugins.less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest(stylesheet_src));
});

`
    shows errors on HTML 
    NOTE: doesn't work very well with EJS <% %> tags
`
gulp.task('check_html', () => {
    return gulp.src(all_html)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter())
});

`
    Checks that all metadata inside of the /metadata folder is valid JSON
`
gulp.task('json_lint', () => {
    return gulp.src(all_json)
        .pipe(plugins.jsonlint())
        .pipe(plugins.jsonlint.reporter(
            (file) => {
                console.error(`File ${file.path} is not valid JSON.`);
            }));
});
`
    Watch Files For Changes
    The watch task is used to run tasks as we make changes to our files. As 
    you write code and modify your files, the gulp.watch() method will listen 
    for changes and automatically run our tasks again so we don't have to 
    continuously jump back to our command-line and run the gulp command each time.
`
let javaScriptWatch = ['lint', 'index_script', 'membership_script', 'contact_script', 'admin_script'],
    cssWatch = ['less', 'autoprefixer'];
    jsonWatch = ['json_lint'],
    watch = ['watch']; // so that it can continue calling the watch task
    allWatch = javaScriptWatch.concat(cssWatch).concat(jsonWatch).concat(watch);


gulp.task('watch', () => {
    gulp.watch([all_javascripts, all_utils_src], javaScriptWatch);
    gulp.watch(less_stylesheets, cssWatch);
    gulp.watch(all_json, jsonWatch);
});

`
    Default Task
`
gulp.task('default', allWatch);





