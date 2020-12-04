const { series, parallel, src, dest, watch } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const webserver = require("gulp-webserver");

const njcks = require("./gulp-nunjucks");

function renamePath(path) {
    if (!path.basename !== "index") {
        path.dirname += "/" + path.basename;
        path.basename = "index";
    }
}

function canvas() {
    return src("src/**/*.js")
        .pipe(
            fileinclude({
                basepath: "includes/",
            })
        )
        .pipe(
            uglify({
                toplevel: true,
            })
        )
        .pipe(
            njcks({
                path: "layouts",
                template: "canvas.njk",
            })
        )
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                removeComments: true,
            })
        )
        .pipe(rename(renamePath))
        .pipe(dest("dist/"));
}

function static() {
    return src("static/**/*").pipe(dest("dist/"));
}

exports.default = exports.build = parallel(static, canvas);

exports.watch = function () {
    watch("static/**/*", static);
    watch("src/**/*.js", canvas);
};

exports.serve = function () {
    src("dist").pipe(
        webserver({
            livereload: true,
        })
    );
};

exports.dev = series(exports.build, parallel(exports.serve, exports.watch));
