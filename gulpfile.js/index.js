const { series, parallel, src, dest, watch } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const webserver = require("gulp-webserver");

const njcks = require("./gulp-nunjucks");

function renamePath(path, file) {
    if (path.basename !== "index") {
        path.dirname += "/" + path.basename;
        path.basename = "index";
    }

    file.originalBasename = path.basename;
}

function renamePathSource(path, file) {
    path.basename = "source";
}
function renamePathRemoveSource(path, file) {
    if (file.originalBasename) {
        path.basename = file.originalBasename;
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
            njcks({
                path: "layouts",
                template: "canvas.njk",
            })
        )
        .pipe(rename(renamePath))
        .pipe(rename(renamePathSource))
        .pipe(dest("dist/"))
        .pipe(rename(renamePathRemoveSource))
        .pipe(
            htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                removeComments: true,
                minifyJS: { toplevel: true },
            })
        )
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
