var gulp        = require("gulp");
var sass        = require('gulp-sass')(require('sass'));
var browserSync = require("browser-sync").create();
var gulpIf      = require('gulp-if');
var terser      = require('gulp-terser');
var cssminify   = require('gulp-clean-css');
var htmlmin     = require('gulp-htmlmin');
var rename      = require('gulp-rename');
var del         = require('del');
var wait        = require('gulp-wait');
var sourceMaps  = require("gulp-sourcemaps")
var concat      = require('gulp-concat')
var order       = require("gulp-order");
var rev         = require('gulp-rev')
var revReplace  = require('gulp-rev-replace')
var useref      = require('gulp-useref')
var filter      = require('gulp-filter');
var uglify      = require('gulp-uglify');
var csso        = require('gulp-csso');

gulp.task('hello', function() {
 return console.log('gulp is running');
});

gulp.task("sass", function(callback) {
  return gulp
    .src("src/resources/sass/themes/*.scss") // compile sass
    .pipe(wait(300))
    .pipe(sass())
    .pipe(gulp.dest("src/public/css"))        // destination
    .pipe(cssminify({zindex: false}))         // min css
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("src/public/css"))        // destination
    .pipe(gulp.dest("src/public/dist/css"));  // destination
});

gulp.task("sassTemp", function(callback) {
  return gulp
    .src("src/resources/sass/homePage/*.scss") // compile sass
    .pipe(wait(300))
    .pipe(sass())
    .pipe(gulp.dest("src/public/css"))        // destination
    .pipe(cssminify({zindex: false}))         // min css
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest("src/public/css"))        // destination
    .pipe(gulp.dest("src/public/dist/css"));  // destination
});

gulp.task("browserSync", function(callback) {
  browserSync.init({
    server: {
      baseDir: "src/resources/views/me"
    },
    startPath: "Blank.Page.hbs"
  });
  callback();
});

gulp.task("watch", function(callback) {
  gulp.watch("src/public/css/sass/**/*.scss", gulp.series("sass", "reload"));
  gulp.watch("src/public/js/**/*.js", gulp.series("reload"));
  // gulp.watch("src/public/*.html", gulp.series("reload"));
  callback();
});

gulp.task("reload", function(callback) {
  browserSync.reload();
  callback();
});


gulp.task("minifyjs", function(callback) {
  return gulp.src('src/public/js/**/*')
  .pipe(order([
    'vendor/jquery-3.3.1.min.js', // jQuery First
    'vendor/bootstrap.bundle.min.js',
    'vendor/**/*.js',  // other files in the ./src/vendor directory
    '/**/*.js' // files in the ./src/app directory
  ]))
  .pipe(sourceMaps.init())
    .pipe(gulpIf('*.js', terser()))
    .pipe(sourceMaps.write())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('src/public/dist/js'))
});

gulp.task("minifycss", function (callback) {
  return gulp.src('src/public/css/vendor/**/*')
    .pipe(order([
      'bootstrap.min.css',
      'component-custom-switch.min.css',
      'perfect-scrollbar.css',
    ]))
      .pipe(sourceMaps.init())
      // .pipe(gulpIf('*.css', cssminify({ zindex: false })))
      .pipe(sourceMaps.write())
      .pipe(concat('Vendorbundle.css'))
      .pipe(gulp.dest('src/public/dist/css'))
});

gulp.task("minifyhtml", function(callback) {
  return gulp.src('src/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('dist'))
});

gulp.task('images', function(callback){
  return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
  .pipe(gulp.dest('dist/img'))
});

gulp.task('font', function(callback) {
  return gulp.src('src/font/**/*')
  .pipe(gulp.dest('dist/font'))
});

gulp.task('clean:dist', function(callback) {
  return del('dist');
})

// gulp.task('default', function (callback) {
//   runSequence(['sass','browserSync', 'watch'],
//     callback
//   )
// })

// gulp.task('build', function (callback) {
//   runSequence('clean:dist', 'sass',
//     ["minifyjs", "minifycss", "minifyhtml", "images", 'font'],
//     callback
//   )
// })

gulp.task('assets', () => {
  var jsFilter = filter("**/*.js", { restore: true });
  var cssFilter = filter("**/*.css", { restore: true });
  var indexHbsFilter = filter(['**/*', '!**/*.hbs'], { restore: true });

  return gulp.src(["src/public/test/test.hbs"])
  .pipe(useref())                 // Combine js and css
  .pipe(jsFilter)
    .pipe(uglify())               // Minify any javascript sources
    .pipe(jsFilter.restore)
  .pipe(cssFilter)
    .pipe(csso())                 // Minify any CSS sources
    .pipe(cssFilter.restore)
  .pipe(indexHbsFilter)           // filter hbs ra 
    .pipe(rev())                  // thay đổi version js và css file
    .pipe(indexHbsFilter.restore) // Hủy filter
  .pipe(revReplace())             // replace version mới vào file cũ của js và css
  .pipe(gulp.dest('dist'));       // xuất file ra dist
})

gulp.task('bigAssets', () => {
  var jsFilter = filter("**/*.js", { restore: true });
  var cssFilter = filter("**/*.css", { restore: true });
  var indexHbsFilter = filter(['**/*', '!**/*.hbs'], { restore: true });

  return gulp.src(["src/resources/views/layouts/admin_copy.hbs"])
  .pipe(useref())                 // Combine js and css
  .pipe(jsFilter)
    .pipe(uglify())               // Minify any javascript sources
    .pipe(jsFilter.restore)
  .pipe(cssFilter)
    .pipe(csso())                 // Minify any CSS sources
    .pipe(cssFilter.restore)
  .pipe(indexHbsFilter)           // filter hbs ra 
    .pipe(rev())                  // thay đổi version js và css file
    .pipe(indexHbsFilter.restore) // Hủy filter
  .pipe(revReplace())             // replace version mới vào file cũ của js và css
  .pipe(gulp.dest('src/public/dist'));       // xuất file ra dist
})


gulp.task('default', gulp.series('sass', gulp.parallel('browserSync', 'watch')));
gulp.task('build', gulp.series('clean:dist', 'sass', gulp.parallel('minifyjs', "minifycss", "minifyhtml", "images", 'font')));
