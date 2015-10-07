var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({lazy:false});
var minifyCss = require('gulp-minify-css');
var htmlreplace = require('gulp-html-replace');



gulp.task('scripts-vendor', function(){
    gulp.src([
        './webapp/lib/d3/d3.min.js',
        './webapp/lib/queue-async/queue.min.js'
        ])
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest('./build/js'));

});

gulp.task('scripts', ['scripts-vendor'], function(){
    //combine all js files of the app


    gulp.src([
        './webapp/js/*.js',
        ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest('./build/js'));

});

// gulp.task('scripts-final', function(){
//     gulp.src([
//         './build/js/tmp-lib.js',
//         './build/js/tmp-app.js'
//         ])
//         .pipe(plugins.concat('app.js'))
//         .pipe(gulp.dest('./build/js'));
// });

gulp.task('css', function(){
    gulp.src([
        './webapp/css/reset.css',
        './webapp/css/styles.css',
        ])
        .pipe(plugins.concat('styles.min.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('copy-index', function() {
    gulp.src([
        './webapp/*.html'
        ])
        .pipe(htmlreplace({
            js: ['js/vendor.js', 'js/app.js'],
            css: ['css/styles.min.css']
        }))    
        .pipe(gulp.dest('./build'));
});

gulp.task('copy-fonts', function() {
    gulp.src([
        './webapp/fonts/**/*'
        ])    
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('copy-img', function() {
    gulp.src([
        './webapp/img/**/*'
        ])    
        .pipe(gulp.dest('./build/img'));
});

gulp.task('copy-data', function() {
    gulp.src([
        './webapp/data/*'
        ])
        .pipe(gulp.dest('./build/data'));
});

gulp.task('reload', function () {
  gulp.src(['./webapp/*.html', './build/*.html'])
    .pipe(plugins.connect.reload());
});

gulp.task('watch',function(){
    gulp.watch(['./webapp/**/*.js'],['scripts', 'reload']);
    gulp.watch('./webapp/css/*.css',['css', 'reload']);
    gulp.watch(['./webapp/*.html'],['copy-index', 'reload']);
});

gulp.task('connect', plugins.connect.server({
    root: ['webapp'],
    port: 8080,
    livereload: true
}));

gulp.task('build',['connect','scripts','css', 'copy-data', 'copy-fonts','copy-index','copy-img','watch']);

gulp.task('default',['connect','scripts','css', 'copy-data', 'copy-fonts','copy-index','copy-img','watch']);

