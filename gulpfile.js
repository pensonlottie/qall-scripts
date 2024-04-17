//调用gulp模块
var gulp = require('gulp')
//调用js文件合并插件
var concat = require('gulp-concat');

//用gulp建立一个all_to_one任务
gulp.task('all2one', function() {
  return gulp.src(['static/jquery.min.js','static/qrgen.min.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('js'));
});