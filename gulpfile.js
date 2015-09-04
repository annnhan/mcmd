var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer')

var pg = require('./package');
var versionName = pg.name + '.' + pg.version

gulp.task('default', ['build']);

gulp.task('build', function () {
    browserify('./src/mcmd.js')
        .bundle()
        .pipe(source(versionName))
        .pipe(buffer())
        .pipe(concat(versionName + '.js'))
        .pipe(gulp.dest('./prd'))
        .pipe(uglify())
        .pipe(concat(versionName + '.min.js'))
        .pipe(gulp.dest('./prd'));
});