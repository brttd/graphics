const nunjucks = require("nunjucks");
const through = require("through2");
const gutil = require("gulp-util");

module.exports = function (options = {}) {
    const opts = {};

    opts.path = options.path || "";
    opts.template = options.template || "";

    const env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(opts.path)
    );

    return through.obj(function (file, _, cb) {
        if (file.isStream()) {
            this.emit(
                "error",
                new Error("gulp-nunjucks: " + "Streams are not supported!")
            );
            return cb();
        }

        if (file.isNull()) {
            return cb(null, file);
        }

        file.path = gutil.replaceExtension(file.path, ".html");

        if (file.isBuffer()) {
            env.render(
                opts.template,
                {
                    content: String(file.contents),
                },
                (err, res) => {
                    if (err) {
                        this.emit(
                            "error",
                            new Error("gulp-nunjucks: " + "Render error:" + err)
                        );

                        return cb();
                    }

                    file.contents = Buffer.from(res);

                    this.push(file);

                    cb();
                }
            );
        } else {
            this.push(file);

            cb();
        }
    });
};

module.exports.render = function (options = {}) {
    const opts = {};

    opts.path = options.path || "";
    opts.template = options.template || "";

    const env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(opts.path)
    );

    return through.obj(function (file, _, cb) {
        if (file.isStream()) {
            this.emit(
                "error",
                new Error("gulp-nunjucks: " + "Streams are not supported!")
            );
            return cb();
        }

        if (file.isNull()) {
            return cb(null, file);
        }

        file.path = gutil.replaceExtension(file.path, ".html");

        if (file.isBuffer()) {
            env.renderString(String(file.contents), file.data, (err, res) => {
                if (err) {
                    this.emit(
                        "error",
                        new Error("gulp-nunjucks: " + "Render error:" + err)
                    );

                    return cb();
                }

                file.contents = Buffer.from(res);

                this.push(file);

                cb();
            });
        } else {
            this.push(file);

            cb();
        }
    });
};
