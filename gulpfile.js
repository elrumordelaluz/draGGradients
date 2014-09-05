var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	livereload = require('gulp-livereload');

gulp.task('styles', function(){
	return gulp.src('src/scss/style.scss')
		.pipe(sass({ style: 'expanded' }))
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest('dist/css'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(minifycss())
		.pipe(gulp.dest('dist/css'))
		.pipe(notify({ message: 'Styles task complete' }));
});


gulp.task('scripts', function(){
	return gulp.src('src/scripts/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('default', function(){
	gulp.start('styles', 'scripts');
});

gulp.task('watch', function(){

	// Watch .scss files
	gulp.watch('src/scss/**/*.scss', ['styles']);
	
	// Watch .js files
	gulp.watch('src/scripts/**/*.js', ['scripts']);
	

	// Create LiveReload server
	livereload.listen();

	// Watch any files in dist/, reload on change
	gulp.watch(['dist/**', 'index.html']).on('change', livereload.changed);

})