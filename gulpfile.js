const gulp = require('gulp')
const compression = require('gulp-compression')

gulp.task('compression', function (done) {
  return gulp.src('app/images/**/*.{jpg,png}')
    .pipe(compression())
    .on('finish', done)
})
