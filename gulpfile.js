// Include gulp
const gulp = require('gulp');
// Include Our Plugins
const plugins = require('gulp-load-plugins')();

const javascript_files = "public/javascripts/*";
const javascript_dest = "public/dist";


const all_json = "server/metadata/*.json";

`
    Lint Task
    Checks any javascript file in our js/ directory and makes sure there are no
        
`
gulp.task('lint', () => {
    return gulp.src(javascript_files)
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
gulp.task('javascript_files', () => {
    return gulp.src([javascript_files + "calendar.js", javascript_files + "chat.js"])
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.concat('utils.js'))
        .pipe(plugins.rename('utils.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(javascript_dest));
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
let javaScriptWatch = ['lint', 'javascript_files'],
    // cssWatch = ['less', 'autoprefixer'];
    jsonWatch = ['json_lint'],
    watch = ['watch']; // so that it can continue calling the watch task
    allWatch = javaScriptWatch.concat(jsonWatch).concat(watch);


gulp.task('watch', () => {
    gulp.watch(javascript_files, javaScriptWatch);
    gulp.watch(all_json, jsonWatch);
});

`
    Default Task
`
gulp.task('default', allWatch);





