var _ = require('underscore');
var debug = require('debug')('gridfs');
var util = require('util');
var Writable = require('stream').Writable;

function GridFs(mongo, db, root) {
    Object.defineProperty(this, 'mongo', {
        get: function() {
            return mongo;
        }
    });
    Object.defineProperty(this, 'db', {
        get: function() {
            return db;
        }
    });
    Object.defineProperty(this, 'root', {
        get: function() {
            return root;
        }
    });
}

/// Asynchronous rename(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.rename = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous ftruncate(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.ftruncate = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous truncate(2). No arguments other than a possible exception are
/// given to the completion callback. A file descriptor can also be passed as
/// the first argument. In this case, GridFs.prototype.ftruncate() is called.
GridFs.prototype.truncate = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous chown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.chown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous fchown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fchown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous lchown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.lchown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous chmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.chmod = function(path, mode, callback) {
    callback();
};

/// Asynchronous fchmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fchmod = function(fd, mode, callback) {
    callback();
};

/// Asynchronous lchmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.lchmod = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous stat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.Stats object.
/// See the GridFs.Stats section below for more information.
GridFs.prototype.stat = function(path, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Asynchronous lstat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.prototype.Stats object. lstat() is identical to stat(),
/// except that if path is a symbolic link, then the link itself is stat-ed,
/// not the file that it refers to.
GridFs.prototype.lstat = function(path, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous fstat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.prototype.Stats object. fstat() is identical to stat(),
/// except that the file to be stat-ed is specified by the file descriptor fd.
GridFs.prototype.fstat = function(fd, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Asynchronous link(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.link = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous symlink(2). No arguments other than a possible exception are
/// given to the completion callback. The type argument can be set to 'dir',
/// 'file', or 'junction' (default is 'file') and is only available on Windows
/// (ignored on other platforms). Note that Windows junction points require the
/// destination path to be absolute. When using 'junction', the destination
/// argument will automatically be normalized to absolute path.
GridFs.prototype.symlink = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous readlink(2). The callback gets two arguments (err, linkString).
GridFs.prototype.readlink = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous realpath(2). The callback gets two arguments (err, resolvedPath).
/// May use process.cwd to resolve relative paths. cache is an object literal
/// of mapped paths that can be used to force a specific path resolution or
/// avoid additional GridFs.prototype.stat calls for known real paths.
GridFs.prototype.realpath = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous unlink(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.unlink = function(path, callback) {
    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    this.mongo.GridStore.unlink(this.db, id, callback);
};

/// Asynchronous rmdir(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.rmdir = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous mkdir(2). No arguments other than a possible exception are
/// given to the completion callback. mode defaults to 0777.
GridFs.prototype.mkdir = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronous readdir(3). Reads the contents of a directory. The callback
/// gets two arguments (err, files) where files is an array of the names of the
/// files in the directory excluding '.' and '..'.
GridFs.prototype.readdir = function(path, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Asynchronous close(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.close = function(fd, callback) {
    fd.close(callback);
};

/// Asynchronous file open.
GridFs.prototype.open = function(path, flags, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = undefined;
    }

    if (! (flags === 'r' || flags === 'w' || flags === 'w+')) {
        return callback(new Error(util.format('Unsupported flag %s', flags)));
    }

    if (flags === 'w') {
        options = _.extend(_.isObject(options) ? options : {}, {
            root: this.root
        });
    } else {
        options = {
            root: this.root
        };
    }

    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), flags, options);

    fd.open(callback);
};

/// #### GridFs#openAsync(path, flags[, mode])
/// Asynchronous file open.
/// Same as `GridFs#open` but returns a `Promise`.

/// Change file timestamps of the file referenced by the supplied path.
GridFs.prototype.utimes = function(path, atime, mtime, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Change the file timestamps of a file referenced by the supplied file
/// descriptor.
GridFs.prototype.futimes = function(fd, atime, mtime, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Asynchronous fsync(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fsync = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Asynchronously write a buffer to the specified file.
GridFs.prototype.write = function(fd, buffer, offset, length, position, callback) {
    if (_.isFunction(position)) {
        callback = position;
        position = undefined;
    }

    if (_.isNumber(position)) {
        fd.seek(position, (function(err) {
            if (err) {
                return callback(err);
            }
            this.write(fd, buffer, offset, length, callback);
        }).bind(this));
    } else {
        fd.write(buffer.slice(offset, offset + length), function(err) {
            // FIXME: find a way to return the number of bytes written
            callback(err, length, buffer);
        });
    }
};

/// #### GridFs#writeAsync(fd, buffer, offset, length[,position])
/// Asynchronously write a buffer to the specified file.
/// Same as `GridFs#write` but returns a `Promise`.

/// #### GridFs#read(fd, buffer, offset, length, position, callback)
/// Asynchronously read data from the specified file.
GridFs.prototype.read = function(fd, buffer, offset, length, position, callback) {
    if (_.isFunction(position)) {
        callback = position;
        position = undefined;
    }

    if (_.isNumber(position)) {
        fd.seek(position, (function(err) {
            if (err) {
                return callback(err);
            }
            this.read(fd, buffer, offset, length, callback);
        }).bind(this));
    } else if (_.isNull(buffer)) {
        fd.read(callback);
    } else {
        length = Math.min(length, fd.length - fd.position);
        if (length > 0) {
            fd.read(length, buffer.slice(offset, offset + length), function(err) {
                callback(err, length, buffer);
            });
        } else {
            callback(null, 0, buffer);
        }
    }
};

/// #### GridFs#readAsync(fd, buffer, offset, length, position, callback)
/// Asynchronously read data from the specified file.
/// Same as `GridFs#read` but return a `Promise`.

/// GridFs#readFile(filename[, options], callback)
/// Asynchronously reads the entire contents of a file.
/// The callback is passed two arguments (err, data), where data is the
/// contents of the file.
GridFs.prototype.readFile = function(filename, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = undefined;
    }

    var self = this;

    return this.openAsync(filename, 'r')
        .then(function(fd) {
            return self.readAsync(fd, null, 0, 0)
                .then(function(data) {
                    return self.closeAsync(fd)
                        .then(function() {
                            return data;
                        });
                });
        })
        .then(callback.bind(null, null))
        .catch(callback);
};

/// Asynchronously writes data to a file, replacing the file if it already
/// exists. data can be a string or a buffer.
GridFs.prototype.writeFile = function(filename, data, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = undefined;
    }

    var self = this;

    self.openAsync(filename, 'w')
        .then(function(fd) {
            return self.writeAsync(fd, data, 0, data.length)
                .then(function() {
                    return fd;
                });
        })
        .then(function(fd) {
            return self.closeAsync(fd);
        })
        .then(callback.bind(null, null))
        .catch(callback);
};

/// Asynchronously append data to a file, creating the file if it not yet
/// exists. data can be a string or a buffer.
GridFs.prototype.appendFile = function(filename, data, options, callback) {
    if (_.isFunction(options)) {
        callback = options;
        options = undefined;
    }

    var self = this;

    self.openAsync(filename, 'w+')
        .then(function(fd) {
            return self.writeAsync(fd, data, 0, data.length)
                .then(function() {
                    return fd;
                });
        })
        .then(function(fd) {
            return self.closeAsync(fd);
        })
        .then(callback.bind(null, null))
        .catch(callback);
};

/// Watch for changes on filename. The callback listener will be called each
/// time the file is accessed.
GridFs.prototype.watchFile = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Stop watching for changes on filename. If listener is specified, only that
/// particular listener is removed. Otherwise, all listeners are removed and
/// you have effectively stopped watching filename.
GridFs.prototype.unwatchFile = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Watch for changes on filename, where filename is either a file or a
/// directory. The returned object is a GridFs.prototype.FSWatcher.
GridFs.prototype.watch = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Test whether or not the given path exists by checking with the file system.
/// Then call the callback argument with either true or false. Example:
GridFs.prototype.exists = function(path, callback) {
    callback(new Error('Not implemented yet')); // TODO
};

/// Tests a user's permissions for the file specified by path. mode is an
/// optional integer that specifies the accessibility checks to be performed.
/// The following constants define the possible values of mode. It is possible
/// to create a mask consisting of the bitwise OR of two or more values.
GridFs.prototype.access = function() {
    _.last(arguments)(new Error('Operation not supported'));
};

/// Returns a new ReadStream object (See Readable Stream).
/// options is an object with the following defaults:
/// ```javascript
/// { flags: 'r',
///   encoding: null,
///   fd: null,
///   mode: 0666,
///   autoClose: true
/// }
/// ```
/// Options can include start and end values to read a range of bytes from the
/// file instead of the entire file. Both start and end are inclusive and start
/// at 0. The encoding can be 'utf8', 'ascii', or 'base64'.
/// If fd is specified, ReadStream will ignore the path argument and will use
/// the specified file descriptor. This means that no open event will be
/// emitted.
/// If autoClose is false, then the file descriptor won't be closed, even if
/// there's an error. It is your responsibility to close it and make sure
/// there's no file descriptor leak. If autoClose is set to true (default
/// behavior), on error or end the file descriptor will be closed
/// automatically.
GridFs.prototype.createReadStream = function(path, options) {
    options = _.defaults(options || {}, {
    });

    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), 'r', {
        root: this.root,
    });

    return fd.stream();
};

GridFs.prototype.createWriteStream = function(path, options) {
    options = _.defaults(options || {}, {});

    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), 'w', {
        root: this.root,
    });

    return fd.stream();
};

function nodify(resolve, reject) {
    return function(err) {
        if (err) {
            reject(err);
        } else {
            var args = _.rest(arguments);
            resolve.apply(null, args.length > 1 ? [args] : args);
        }
    };
}

function promisify(fun) {
    return function() {
        var self = this;
        var args = _.toArray(arguments);
        return new Promise(function(resolve, reject) {
            fun.apply(self, args.concat(nodify(resolve, reject)));
        });
    };
}

_.extend(GridFs.prototype, _.chain(GridFs.prototype)
    .functions()
    .without('createReadStream', 'createWriteStream')
    .map(function(method_name) {
        return [
            method_name + 'Async',
            promisify(GridFs.prototype[method_name])
        ];
    })
    .object()
    .value()
);

module.exports = GridFs;
