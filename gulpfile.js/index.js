const { series, parallel, src, dest, watch } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");

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

exports.default = parallel(static, canvas);

exports.watch = function () {
    watch("static/**/*", { ignoreInitial: false }, static);
    watch("src/**/*.js", { ignoreInitial: false }, canvas);
};
