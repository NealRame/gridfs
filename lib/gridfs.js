var _ = require('underscore');
var util = require('util');

/// # GridFS
/// A compatible 'fs' interface for mongodb GridStore.
///
/// Example:
///
/// ```javascript
/// var GridFS = require('gridfs');
/// var fs = require('fs');
///
/// var gfs = new GridFS(mongo, db, 'files');
///
/// gfs.open('554385768a812acf16c3dd44', function(err, file) {
///     if (! err) {
///         return ;
///     }
///     var buffer = new Buffer(128);
///     gfs.read(file, buffer, 0, buffer.length, function(err, bytes_read) {
///         if (! err) {
///             console.log(buffer.slice(0, bytes_read).toString());
///         }
///         gfs.close(file);
///     });
/// });
/// ```
///
/// Some functionalities of the 'fs' interface are not supported, like creating
/// directories, creating symbolic link, ...

/// ## API


/// ### GridFs(mongo, db[, root])
/// Construct a `GridFs` instance.
///
/// __Parameters:__
/// - `mongo`, the mongo driver instance.
/// - `db`, the database to query.
/// - `root`, _optional_, the root collection that holds the files and chunks
/// collection. Default value is `mongo.GridStore.DEFAULT_ROOT_COLLECTION`.
function GridFs(mongo, db, root) {
    root = root || mongo.GridStore.DEFAULT_ROOT_COLLECTION;
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


/// ### GridFS#rename()
/// Not supported.
GridFs.prototype.rename = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#ftruncate()
/// Not supported.
GridFs.prototype.ftruncate = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#truncate()
/// Not supported.
GridFs.prototype.truncate = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#chown()
/// Not supported.
GridFs.prototype.chown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#fchown()
/// Not supported.
GridFs.prototype.fchown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#lchown()
/// Not supported.
GridFs.prototype.lchown = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#chmod()
/// Not supported.
GridFs.prototype.chmod = function(path, mode, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#fchmod()
/// Not supported.
GridFs.prototype.fchmod = function(fd, mode, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#lchmod()
/// Not supported.
GridFs.prototype.lchmod = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#stat(id, callback)
/// Stat the file referenced by the given id.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `callback(err, stats)`, a nodejs style callback.
///
/// See GridFs.Stats for more info about stat object.
GridFs.prototype.stat = function(path, callback) {
    var stat;
    var self = this;
    this.openAsync(path, 'r')
        .then(function(file) {
            return self.fstatAsync(file)
                .then(function(stat_) {
                    stat = stat_;
                    return file;
                })
                .then(function(file) {
                    return self.closeAsync(file);
                })
                .then(function() {
                    callback(null, stat);
                })
        })
        .catch(callback);
};

/// ### GridFS#statAsync(id, callback)
/// Same as `GridFS#stat` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
///
/// __Return:__
/// - a `Promise`.
///
/// See GridFs.Stats for more info about stat object.


/// ### GridFS#lstat()
/// Not supported.
GridFs.prototype.lstat = function(path, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#fstat(file, callback)
/// Stat the specified file.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `callback(err, stats)`, a nodejs style callback.
///
/// See GridFs.Stats for more info about stat object.
GridFs.prototype.fstat = function(file, callback) {
    callback(null, {
        isFile: _.constant(true),
        isDirectory: _.constant(false),
        isBlockDevice: _.constant(false),
        isCharacterDevice: _.constant(false),
        isSymbolicLink: _.constant(false),
        isFIFO: _.constant(false),
        isSocket: _.constant(false),
        dev: 0,
        ino: 0,
        mode: 0,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: 0,
        size: file.length,
        blksize: 0,
        blocks: 0,
        atime: file.uploadDate,
        mtime: file.uploadDate,
        ctime: file.uploadDate,
        birthTime: file.uploadDate,
        contentType: file.contentType
    });
};

/// ### GridFS#fstatAsync(id, callback)
/// Same as `GridFS#fstat` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
///
/// __Return:__
/// - a `Promise`.
///
/// See GridFs.Stats for more info about stat object.


/// ### GridFS#link()
/// Not supported.
GridFs.prototype.link = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#symlink()
/// Not supported.
GridFs.prototype.symlink = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#readlink()
/// Not supported.
GridFs.prototype.readlink = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#realpath()
/// Not supported.
GridFs.prototype.realpath = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#unlink(id, callback)
/// Asynchronously erases the file specified by the given id.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `callback`, a nodejs style callback.
GridFs.prototype.unlink = function(path, callback) {
    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), 'w');
    fd.unlink(callback);
};

/// ### GridFS#unlinkAsync(id)
/// Same as `GridFS#unlink` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#rmdir()
/// Not supported.
GridFs.prototype.rmdir = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#mkdir()
/// Not supported.
GridFs.prototype.mkdir = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#readdir([path,] callback)
/// Asynchronously returns the list of files in the filesystem.
///
/// __Parameters:__
/// - `path`, _optional_, not used.
/// - `callback(err, entries)`, a nodejs style callback.
GridFs.prototype.readdir = function() {
    var callback = _.last(arguments);
    this.mongo.GridStore.list(this.db, this.root, callback);
};

/// ### GridFS#readdirAsync([path])
/// Same as `GridFS#readdir` but it returns a `Promise`.
///
/// __Parameters:__
/// - `path`, _optional_, not used.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#close(file, callback)
/// Asynchronously close the given file.
///
/// __Parameters:__
/// - `file`, the file to close.
/// - `callback(err)`, a nodejs style callback.
GridFs.prototype.close = function(fd, callback) {
    fd.close(callback);
};

/// ### GridFS#closeAsync(file)
/// Same as `GridFS#close` but it returns a `Promise`.
///
/// __Parameters:__
/// - `file`, the file to close.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#open(id, mode[, options], callback)
/// Asynchronously open the given file.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `mode`, the file open mode. Valid modes are `'r'`, `'w'` and `'w+'`.
/// - `options`, _optional_, mongodb options to use when creating a file,
///   ignored when opening with flags `'r'`.
/// - `callback(err, file)`, a nodejs style callback.
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


/// ### GridFS#openAsync(id, mode[, options])
/// Same as `GridFS#open` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `mode`, the file open mode. Valid modes are `'r'`, `'w'` and `'w+'`.
/// - `options`, _optional_, mongodb options to use when creating a file,
///   ignored when opening with flags `'r'`.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#utimes()
/// Not supported.
GridFs.prototype.utimes = function(path, atime, mtime, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#futimes()
/// Not supported.
GridFs.prototype.futimes = function(fd, atime, mtime, callback) {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#fsync()
/// Not supported.
GridFs.prototype.fsync = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFs#write(file, buffer, offset, length[, position], callback) {
/// Asynchronously write a buffer to the specified file.
///
/// __Parameters:__
/// - `file`, the file to be written to.
/// - `buffer`, the data to be written.
/// - `offset`, the offset of the data in the buffer to be written.
/// - `length`, the length of the data in the buffer to be written.
/// - `position`, _optional_, not support will fail.
/// - `callback(err, bytes_written, buffer)`, a nodejs style callback.
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

/// ### GridFs#writeAsync(fd, buffer, offset, length[,position])
/// Same as `GridFS#write` but it returns a `Promise`.
///
/// __Parameters:__
/// - `file`, the file to write to.
/// - `buffer`, the data to be written.
/// - `offset`, the offset of the data in the buffer to be written.
/// - `length`, the length of the data in the buffer to be written.
/// - `position`, _optional_, not support will fail.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFs#read(file, buffer, offset, length[, position], callback)
/// Asynchronously reads data from the given file.
///
/// __Parameters:__
/// - `file`, the file to read from.
/// - `buffer`, the buffer to store read data.
/// - `offset`, the offset where to start storing read data.
/// - `length`, the length of data to be read.
/// - `position`, _optional_, where to start reading in the file.
/// - `callback(err, bytes_read, buffer)`, a nodejs style callback.
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

/// ### GridFs#read(file, buffer, offset, length[, position])
/// Same as `GridFS#read` but it returns a `Promise`.
///
/// __Parameters:__
/// - `file`, the file to read from.
/// - `buffer`, the buffer to store read data.
/// - `offset`, the offset where to start storing read data.
/// - `length`, the length of data to be read.
/// - `position`, _optional_, where to start reading in the file.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFs#readFile(id[, options], callback)
/// Asynchronously reads the entire contents of a file.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `options`, _optional_, not used.
/// - `callback(err, buffer)`, a nodejs style callback.
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

/// ### GridFs#readFileAsync(id[, options])
/// Same as `GridFS#readFile` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `options`, _optional_, not used.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFs#writeFile(id, data[, options], callback) {
/// Asynchronously writes data to a file, replacing the file if it already
/// exists.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `data`, data could be `String` or a `Buffer`.
/// - `options`, _optional_, not used.
/// - `callback(err)`, a nodejs style callback.
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

/// ### GridFs#writeFileAsync(id, data[, options])
/// Same as `GridFS#writeFile` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `data`, data could be `String` or a `Buffer`.
/// - `options`, _optional_, not used.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#appendFile()
/// Not supported.
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


/// ### GridFS#watchFile()
/// Not supported.
GridFs.prototype.watchFile = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#unwatchFile()
/// Not supported.
GridFs.prototype.unwatchFile = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFS#watch()
/// Not supported.
GridFs.prototype.watch = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFs#exists(id, callback)
/// Test whether or not the specified file exists.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `callback(err, exist)`, a nodejs style callback.
GridFs.prototype.exists = function(path, callback) {
    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    this.mongo.GridStore.exist(this.db, id, this.root, callback);
};

/// ### GridFs#existsAsync(id)
/// Same as `GridFS#exists` but it returns a `Promise`.
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
///
/// __Return:__
/// - a `Promise`.


/// ### GridFS#access()
/// Not supported.
GridFs.prototype.access = function() {
    _.last(arguments)(new Error('Operation not supported'));
};


/// ### GridFs#createReadStream(id[, options])
/// Returns a new ReadStream (See `Readable` Stream).
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `options`, _options_, not used.
GridFs.prototype.createReadStream = function(path, options) {
    options = _.defaults(options || {}, {
    });

    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), 'r', {
        root: this.root,
    });

    return fd.stream();
};


/// ### GridFs#createWriteStream(id[, options])
/// Returns a new WriteStream (See `Writable` Stream).
///
/// __Parameters:__
/// - `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
/// - `options`, _optional_, mongodb options to use when creating a file.
GridFs.prototype.createWriteStream = function(path, options) {
    options = _.extend(_.isObject(options) ? options : {}, {
        root: this.root
    });

    var id = _.isString(path) ? new this.mongo.ObjectId(path) : path;
    var fd = new this.mongo.GridStore(this.db, id, id.toString(), 'w', options);

    return fd.stream();
};


/// ### GridFs.Stats
/// Objects returned from fs.stat(), and fs.fstat() and their promisified
/// counterparts are of this type.
///
/// - `stats.isFile()`, always returns `true`.
/// - `stats.isDirectory()`, always return `false`.
/// - `stats.isBlockDevice()`, always return `false`.
/// - `stats.isCharacterDevice()`, always return `false`.
/// - `stats.isSymbolicLink()`, always return `false`.
/// - `stats.isFIFO()`, always return `false`.
/// - `stats.isSocket()`, always return `false`.
///
/// `util.inspect(stats)` would return a string very similar to this:
/// ```javascript
/// { dev: 0,
///   ino: 0,
///   mode: 0,
///   nlink: 1,
///   uid: 0,
///   gid: 0,
///   rdev: 0,
///   size: 12345,
///   blksize: 0,
///   blocks: Ø,
///   atime: Mon, 10 Oct 2011 23:24:11 GMT,
///   mtime: Mon, 10 Oct 2011 23:24:11 GMT,
///   ctime: Mon, 10 Oct 2011 23:24:11 GMT,
///   birthtime: Mon, 10 Oct 2011 23:24:11 GMT
///   contentType: 'image/png' }
/// ```


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
