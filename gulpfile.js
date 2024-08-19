'use strict';

const { src, dest } = require('gulp');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const argv = require('yargs').argv;
const rename = require('gulp-rename');

const Vinyl = require('vinyl');

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true });
  src._read = function () {
    this.push(
      new Vinyl({
        cwd: '',
        base: '/src',
        path: filename,
        contents: Buffer.from(string, 'utf-8'),
      })
    );
    this.push(null);
  };
  return src;
}

/* Paths */
const srcPath = 'styles/';
const distPath = 'assets/';
const path = {
  build: {
    css: distPath,
  },
  src: {
    css: srcPath + '*.scss',
  },
  watch: {
    css: srcPath + '**/*.scss',
  },
};

function css(cb) {
  return src(path.src.css, {})
    .pipe(
      sass({
        includePaths: './node_modules/',
      })
    )
    .pipe(
      autoprefixer({
        cascade: true,
      })
    )
    .pipe(cssbeautify())
    .pipe(removeComments())
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));

  cb();
}

function cssWatch(cb) {
  return src(path.src.css, {})
    .pipe(
      sass({
        includePaths: './node_modules/',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({ stream: true }));

  cb();
}

function watchFiles() {
  gulp.watch([path.watch.css], cssWatch);
}

function createLiquidSection() {
  if (argv.section?.length) {
    const arr = argv.section.split(' ');

    arr.forEach((element) => {
      return string_src(
        `none`,
        `{{ 'section-${element}.css' | asset_url | stylesheet_tag }} 
{% schema %}
{
"name": "${element}",
"tag": "section",
"class": "",
"disabled_on": {
"groups": ["header", "footer"]
},
"settings": []
}
{% endschema %}
`
      )
        .pipe(
          rename(() => {
            return {
              dirname: '.',
              basename: element,
              extname: '.liquid',
            };
          })
        )
        .pipe(dest('sections'), { overwrite: false, append: true });
    });

    return Promise.resolve('значение игнорируется');
  } else {
    return Promise.resolve('значение игнорируется');
  }
}

function createStyles() {
  if (argv.section?.length) {
    const arr = argv.section.split(' ');

    arr.forEach((element) => {
      return string_src(
        `none`,
        `@import "vendor/vars";
@import "vendor/mixins";`
      )
        .pipe(
          rename(() => {
            return {
              dirname: '.',
              basename: 'section-' + element,
              extname: '.scss',
            };
          })
        )
        .pipe(dest('styles'), { overwrite: false, append: true });
    });

    return Promise.resolve('значение игнорируется');
  } else {
    return Promise.resolve('значение игнорируется');
  }
}

const start = gulp.series(gulp.parallel(css));
const watch = gulp.parallel(start, watchFiles);
const makeSection = gulp.series(gulp.parallel(createLiquidSection, createStyles));

exports.default = watch;
exports['make'] = makeSection;
