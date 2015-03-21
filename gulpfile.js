var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename')


gulp.task('min', function() {
	gulp.src('bluebird-harness.js')
		.pipe(uglify())
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('./'))
})