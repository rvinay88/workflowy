var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var cssnano = require('gulp-cssnano');
var spritesmith = require('gulp.spritesmith');
var htmlmin = require('gulp-htmlmin');
var autoprefixer = require('gulp-autoprefixer');
var nunjucks = require('gulp-nunjucks');
var data = require('gulp-data');
var nunjucksRender = require('gulp-nunjucks-render')

// Sass
gulp.task('sass', function(){
  return gulp.src('src/css/sass/**/*.scss')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('src/css/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Images
gulp.task('images', function(){
  return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
  })))
  .pipe(gulp.dest('dist/img'))
});

// Sprites

gulp.task('sprites', function () {
  var spriteData = gulp.src(['src/img/sprites/*.png'])
  .pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '../css/sprite.css'
  }));
  return spriteData.pipe(gulp.dest('src/img'));
});

// Fonts
gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// Clean
gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// browserSync
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
})

// Minify html
gulp.task('minifyHTML', function() {
  return gulp.src('dist/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

// useref
gulp.task('useref', function(){
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.css', autoprefixer()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

// nunjucks

gulp.task('nunjucks', function() {
  return gulp.src('src/views/*.njk')
  .pipe(data(function() {
    return require('./src/views/data/data.json')
  }))
  .pipe(nunjucksRender({
    path: ['src/views/', 'src/views/data', 'src/views/partials', 'src/views/layout', 'src/views/macros'] 
  }))
  .pipe(gulp.dest('src'))
});


// Build task
gulp.task('build', function (callback) {
  runSequence('clean:dist', 'nunjucks', 'sprites',
    ['sass', 'useref', 'images', 'fonts'], 'minifyHTML',
    callback
  )
});

// Default task
gulp.task('default', function (callback) {
  runSequence('build', ['sass','browserSync', 'watch'],
    callback
  )
});

// Watch task
gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('src/css/sass/**/*.scss', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/**/*.njk', ['build']);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});
