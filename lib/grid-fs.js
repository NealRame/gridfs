
function GridFs(mongo, db, root) {
}

/// Asynchronous rename(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.rename = function(oldPath, newPath, callback) {
}

/// Asynchronous ftruncate(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.ftruncate = function(fd, len, callback) {
}

/// Asynchronous truncate(2). No arguments other than a possible exception are
/// given to the completion callback. A file descriptor can also be passed as
/// the first argument. In this case, GridFs.prototype.ftruncate() is called.
GridFs.prototype.truncate = function(path, len, callback) {
}

/// Asynchronous chown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.chown = function(path, uid, gid, callback) {
}

/// Asynchronous fchown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fchown = function(fd, uid, gid, callback) {
}

/// Asynchronous lchown(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.lchown = function(path, uid, gid, callback) {
}

/// Asynchronous chmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.chmod = function(path, mode, callback) {
}

/// Asynchronous fchmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fchmod = function(fd, mode, callback) {
}

/// Asynchronous lchmod(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.lchmod = function(path, mode, callback) {
}

/// Asynchronous stat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.prototype.Stats object.
/// See the GridFs.prototype.Stats section below for more information.
GridFs.prototype.stat = function(path, callback) {
}

/// Asynchronous lstat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.prototype.Stats object. lstat() is identical to stat(),
/// except that if path is a symbolic link, then the link itself is stat-ed,
/// not the file that it refers to.
GridFs.prototype.lstat = function(path, callback) {
}

/// Asynchronous fstat(2). The callback gets two arguments (err, stats) where
/// stats is a GridFs.prototype.Stats object. fstat() is identical to stat(),
/// except that the file to be stat-ed is specified by the file descriptor fd.
GridFs.prototype.fstat = function(fd, callback) {
}

/// Asynchronous link(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.link = function(srcpath, dstpath, callback) {
}

/// Asynchronous symlink(2). No arguments other than a possible exception are
/// given to the completion callback. The type argument can be set to 'dir',
/// 'file', or 'junction' (default is 'file') and is only available on Windows
/// (ignored on other platforms). Note that Windows junction points require the
/// destination path to be absolute. When using 'junction', the destination
/// argument will automatically be normalized to absolute path.
GridFs.prototype.symlink = function(srcpath, dstpath[, type], callback) {
}

/// Asynchronous readlink(2). The callback gets two arguments (err, linkString).
GridFs.prototype.readlink = function(path, callback) {
}

/// Asynchronous realpath(2). The callback gets two arguments (err, resolvedPath).
/// May use process.cwd to resolve relative paths. cache is an object literal
/// of mapped paths that can be used to force a specific path resolution or
/// avoid additional GridFs.prototype.stat calls for known real paths.
GridFs.prototype.realpath = function(path[, cache], callback) {
}

/// Asynchronous unlink(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.unlink = function(path, callback) {
}

/// Asynchronous rmdir(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.rmdir = function(path, callback) {
}

/// Asynchronous mkdir(2). No arguments other than a possible exception are
/// given to the completion callback. mode defaults to 0777.
GridFs.prototype.mkdir = function(path[, mode], callback) {
}

/// Asynchronous readdir(3). Reads the contents of a directory. The callback
/// gets two arguments (err, files) where files is an array of the names of the
/// files in the directory excluding '.' and '..'.
GridFs.prototype.readdir = function(path, callback) {
}

/// Asynchronous close(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.close = function(fd, callback) {
}

/// Asynchronous file open. See open(2). flags can be:
GridFs.prototype.open = function(path, flags[, mode], callback) {
}

/// Change file timestamps of the file referenced by the supplied path.
GridFs.prototype.utimes = function(path, atime, mtime, callback) {
}

/// Change the file timestamps of a file referenced by the supplied file
/// descriptor.
GridFs.prototype.futimes = function(fd, atime, mtime, callback) {
}

/// Asynchronous fsync(2). No arguments other than a possible exception are
/// given to the completion callback.
GridFs.prototype.fsync = function(fd, callback) {
}

/// Write buffer to the file specified by fd.
GridFs.prototype.write = function(fd, buffer, offset, length[, position], callback) {
}

/// Read data from the file specified by fd.
GridFs.prototype.read = function(fd, buffer, offset, length, position, callback) {
}

/// Asynchronously reads the entire contents of a file.
/// The callback is passed two arguments (err, data), where data is the
/// contents of the file.
GridFs.prototype.readFile = function(filename[, options], callback) {
}

/// Asynchronously writes data to a file, replacing the file if it already
/// exists. data can be a string or a buffer.
GridFs.prototype.writeFile = function(filename, data[, options], callback) {
}

/// Asynchronously append data to a file, creating the file if it not yet
/// exists. data can be a string or a buffer.
GridFs.prototype.appendFile = function(filename, data[, options], callback) {
}

/// Watch for changes on filename. The callback listener will be called each
/// time the file is accessed.
GridFs.prototype.watchFile = function(filename[, options], listener) {
}

/// Stop watching for changes on filename. If listener is specified, only that
/// particular listener is removed. Otherwise, all listeners are removed and
/// you have effectively stopped watching filename.
GridFs.prototype.unwatchFile = function(filename[, listener]) {
}

/// Watch for changes on filename, where filename is either a file or a
/// directory. The returned object is a GridFs.prototype.FSWatcher.
GridFs.prototype.watch = function(filename[, options][, listener]) {
}

/// Test whether or not the given path exists by checking with the file system.
/// Then call the callback argument with either true or false. Example:
GridFs.prototype.exists = function(path, callback) {
}

/// Tests a user's permissions for the file specified by path. mode is an
/// optional integer that specifies the accessibility checks to be performed.
/// The following constants define the possible values of mode. It is possible
/// to create a mask consisting of the bitwise OR of two or more values.
GridFs.prototype.access = function(path[, mode], callback) {
}

/// Returns a new ReadStream object (See Readable Stream).
/// options is an object with the following defaults:
/// ```javascript
/// { flags: 'r',
///   encoding: null,
///   fd: null,
///   mode: 0666,
///  autoClose: true
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
GridFs.prototype.createReadStream = function(path[, options]) {
}

GridFs.prototype.createWriteStream = function(path[, options]) {
}
