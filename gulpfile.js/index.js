const { series, parallel, src, dest, watch } = require("gulp");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const webserver = require("gulp-webserver");

const njcks = require("./gulp-nunjucks");
const data = require("./gulp-datastore");

const globs = {
    static: "static/**/*",
    html: ["src/**/*.njk", "src/**/*.html"],

    canvas: "src/**/*.js",
    glsl: "src/**/*.frag",
};

function indexPath(path, file) {
    if (path.basename !== "index") {
        path.dirname += "/" + path.basename;
        path.basename = "index";
    }

    file.url = path.dirname.replace("\\", "/");

    file.originalBasename = path.basename;
}

function addPathSource(path, file) {
    path.basename = "source";
}
function removePathSource(path, file) {
    if (file.originalBasename) {
        path.basename = file.originalBasename;
    }
}

function canvas() {
    return src(globs.canvas)
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
        .pipe(rename(indexPath))
        .pipe(
            data.read((file, store, cb) => {
                store.remove("pages", file.url);
                store.push("pages", file.url);

                cb();
            })
        )
        .pipe(rename(addPathSource))
        .pipe(dest("dist/"))
        .pipe(rename(removePathSource))
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

function glsl() {
    return src(globs.glsl)
        .pipe(
            fileinclude({
                basepath: "includes/",
            })
        )
        .pipe(
            njcks({
                path: "layouts",
                template: "glsl.njk",
            })
        )
        .pipe(rename(indexPath))
        .pipe(
            data.read((file, store, cb) => {
                store.remove("pages", file.url);
                store.push("pages", file.url);

                cb();
            })
        )
        .pipe(rename(addPathSource))
        .pipe(dest("dist/"))
        .pipe(rename(removePathSource))
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

function html() {
    return src(globs.html)
        .pipe(
            fileinclude({
                basepath: "includes/",
            })
        )
        .pipe(data.write())
        .pipe(
            njcks.render({
                path: "layouts",
            })
        )
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
    return src(globs.static).pipe(dest("dist/"));
}

const build = series(parallel(static, canvas, glsl), html);

exports.default = exports.build = build;

exports.watch = function () {
    watch(globs.static, static);
    watch(globs.canvas, canvas);
    watch(globs.glsl, glsl);
    watch(globs.html, html);
};

exports.serve = function () {
    src("dist").pipe(
        webserver({
            livereload: true,
        })
    );
};

exports.dev = series(build, parallel(exports.serve, exports.watch));
