const through = require("through2");

const datastore = {};

const store = {
    set: function (name, value) {
        if (typeof name !== "string") {
            return;
        }

        datastore[name] = value;
    },
    get: function (name) {
        if (typeof name !== "string") {
            return;
        }

        if (datastore.hasOwnProperty(name)) {
            return datastore[name];
        }
    },
    push: function (name, value) {
        if (typeof name !== "string") {
            return;
        }

        if (!Array.isArray(datastore[name])) {
            datastore[name] = [];
        }

        datastore[name].push(value);
    },
    remove: function (name, value) {
        if (typeof name !== "string") {
            return;
        }

        if (!Array.isArray(datastore[name])) {
            datastore[name] = [];

            return false;
        }

        let index = datastore[name].indexOf(value);

        if (index !== -1) {
            datastore[name].splice(index, 1);

            return true;
        }

        return false;
    },
};

exports.store = store;

exports.read = function (reader) {
    return through.obj(function (file, _, cb) {
        reader(file, store, (err, res) => {
            if (err) {
                this.emit(
                    "error",
                    new Error("gulp-datastore: " + "store error!")
                );

                return cb();
            } else {
                if (typeof res === "object") {
                    for (let key in res) {
                        store.set(key, res[key]);
                    }
                }

                this.push(file);
                cb();
            }
        });
    });
};

exports.write = function () {
    return through.obj(function (file, _, cb) {
        file.data = datastore;

        this.push(file);

        cb();
    });
};
