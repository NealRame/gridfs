# GridFS
A compatible 'fs' interface for mongodb GridStore.

Example:

```javascript
var GridFS = require('gridfs');
var fs = require('fs');

var gfs = new GridFS(mongo, db, 'files');

gfs.open('554385768a812acf16c3dd44', function(err, file) {
    if (! err) {
        return ;
    }
    var buffer = new Buffer(128);
    gfs.read(file, buffer, 0, buffer.length, function(err, bytes_read) {
        if (! err) {
            console.log(buffer.slice(0, bytes_read).toString());
        }
        gfs.close(file);
    });
});
```

Some functionalities of the 'fs' interface are not supported, like creating
directories, creating symbolic link, ...

## API

### GridFs(mongo, db[, root])
Construct a `GridFs` instance.

__Parameters:__
- `mongo`, the mongo driver instance.
- `db`, the database to query.
- `root`, _optional_, the root collection that holds the files and chunks
collection. Default value is `mongo.GridStore.DEFAULT_ROOT_COLLECTION`.

### GridFS#rename()
Not supported.

### GridFS#ftruncate()
Not supported.

### GridFS#truncate()
Not supported.

### GridFS#chown()
Not supported.

### GridFS#fchown()
Not supported.

### GridFS#lchown()
Not supported.

### GridFS#chmod()
Not supported.

### GridFS#fchmod()
Not supported.

### GridFS#lchmod()
Not supported.

### GridFS#stat(id, callback)
Stat the file referenced by the given id.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback(err, stats)`, a nodejs style callback.

See GridFs.Stats for more info about stat object.

### GridFS#statAsync(id, callback)
Same as `GridFS#stat` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback(err, stats)`, a nodejs style callback.

See GridFs.Stats for more info about stat object.

### GridFS#lstat()
Not supported.

### GridFS#fstat(file, callback)
Stat the specified file.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback(err, stats)`, a nodejs style callback.

See GridFs.Stats for more info about stat object.

### GridFS#fstatAsync(id, callback)
Same as `GridFS#fstat` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback(err, stats)`, a nodejs style callback.

See GridFs.Stats for more info about stat object.

### GridFS#link()
Not supported.

### GridFS#symlink()
Not supported.

### GridFS#readlink()
Not supported.

### GridFS#realpath()
Not supported.

### GridFS#unlink(id, callback)
Asynchronously erases the file specified by the given id.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback`, a nodejs style callback.

### GridFS#unlinkAsync(id)
Same as `GridFS#unlink` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.

__Return:__
- a `Promise`.

### GridFS#rmdir()
Not supported.

### GridFS#mkdir()
Not supported.

### GridFS#readdir([path,] callback)
Asynchronously returns the list of files in the filesystem.

__Parameters:__
- `path`, _optional_, not used.
- `callback(err, entries)`, a nodejs style callback.

### GridFS#readdirAsync([path])
Same as `GridFS#readdir` but it returns a `Promise`.

__Parameters:__
- `path`, _optional_, not used.

__Return:__
- a `Promise`.

### GridFS#close(file, callback)
Asynchronously close the given file.

__Parameters:__
- `file`, the file to close.
- `callback(err)`, a nodejs style callback.

### GridFS#closeAsync(file)
Same as `GridFS#close` but it returns a `Promise`.

__Parameters:__
- `file`, the file to close.

__Return:__
- a `Promise`.

### GridFS#open(id, mode[, options], callback)
Asynchronously open the given file.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `mode`, the file open mode. Valid modes are `'r'`, `'w'` and `'w+'`.
- `options`, _optional_, mongodb options to use when creating a file,
  ignored when opening with flags `'r'`.
- `callback(err, file)`, a nodejs style callback.

### GridFS#openAsync(id, mode[, options])
Same as `GridFS#open` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `mode`, the file open mode. Valid modes are `'r'`, `'w'` and `'w+'`.
- `options`, _optional_, mongodb options to use when creating a file,
  ignored when opening with flags `'r'`.

__Return:__
- a `Promise`.

### GridFS#utimes()
Not supported.

### GridFS#futimes()
Not supported.

### GridFS#fsync()
Not supported.

### GridFs#write(file, buffer, offset, length[, position], callback) {
Asynchronously write a buffer to the specified file.

__Parameters:__
- `file`, the file to be written to.
- `buffer`, the data to be written.
- `offset`, the offset of the data in the buffer to be written.
- `length`, the length of the data in the buffer to be written.
- `position`, _optional_, not support will fail.
- `callback(err, bytes_written, buffer)`, a nodejs style callback.

### GridFs#writeAsync(fd, buffer, offset, length[,position])
Same as `GridFS#write` but it returns a `Promise`.

__Parameters:__
- `file`, the file to write to.
- `buffer`, the data to be written.
- `offset`, the offset of the data in the buffer to be written.
- `length`, the length of the data in the buffer to be written.
- `position`, _optional_, not support will fail.

__Return:__
- a `Promise`.

### GridFs#read(file, buffer, offset, length[, position], callback)
Asynchronously reads data from the given file.

__Parameters:__
- `file`, the file to read from.
- `buffer`, the buffer to store read data.
- `offset`, the offset where to start storing read data.
- `length`, the length of data to be read.
- `position`, _optional_, where to start reading in the file.
- `callback(err, bytes_read, buffer)`, a nodejs style callback.

### GridFs#read(file, buffer, offset, length[, position])
Same as `GridFS#read` but it returns a `Promise`.

__Parameters:__
- `file`, the file to read from.
- `buffer`, the buffer to store read data.
- `offset`, the offset where to start storing read data.
- `length`, the length of data to be read.
- `position`, _optional_, where to start reading in the file.

__Return:__
- a `Promise`.

### GridFs#readFile(id[, options], callback)
Asynchronously reads the entire contents of a file.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `options`, _optional_, not used.
- `callback(err, buffer)`, a nodejs style callback.

### GridFs#readFileAsync(id[, options])
Same as `GridFS#readFile` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `options`, _optional_, not used.

__Return:__
- a `Promise`.

### GridFs#writeFile(id, data[, options], callback) {
Asynchronously writes data to a file, replacing the file if it already
exists.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `data`, data could be `String` or a `Buffer`.
- `options`, _optional_, not used.
- `callback(err)`, a nodejs style callback.

### GridFs#writeFileAsync(id, data[, options])
Same as `GridFS#writeFile` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `data`, data could be `String` or a `Buffer`.
- `options`, _optional_, not used.

__Return:__
- a `Promise`.

### GridFS#appendFile()
Not supported.

### GridFS#watchFile()
Not supported.

### GridFS#unwatchFile()
Not supported.

### GridFS#watch()
Not supported.

### GridFs#exists(id, callback)
Test whether or not the specified file exists.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `callback(err, exist)`, a nodejs style callback.

### GridFs#existsAsync(id)
Same as `GridFS#exists` but it returns a `Promise`.

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.

__Return:__
- a `Promise`.

### GridFS#access()
Not supported.

### GridFs#createReadStream(id[, options])
Returns a new ReadStream (See `Readable` Stream).

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `options`, _options_, not used.

### GridFs#createWriteStream(id[, options])
Returns a new WriteStream (See `Writable` Stream).

__Parameters:__
- `id`, a `mongo.ObjectId` or a `String` convertible to a `mongo.ObjectId`.
- `options`, _optional_, mongodb options to use when creating a file.

### GridFs.Stats
Objects returned from `GridFs#stat()`, and `GridFs.fstat()` and their
promisified counterparts are of this type.

- `stats.isFile()`, always returns `true`.
- `stats.isDirectory()`, always return `false`.
- `stats.isBlockDevice()`, always return `false`.
- `stats.isCharacterDevice()`, always return `false`.
- `stats.isSymbolicLink()`, always return `false`.
- `stats.isFIFO()`, always return `false`.
- `stats.isSocket()`, always return `false`.

`util.inspect(stats)` would return a string very similar to this:
```javascript
{ dev: 0,
  ino: 0,
  mode: 0,
  nlink: 1,
  uid: 0,
  gid: 0,
  rdev: 0,
  size: 12345,
  blksize: 0,
  blocks: Ø,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT
  contentType: 'image/png' }
```
