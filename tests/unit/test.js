var _ = require('underscore');
var async = require('async');
var chai = require('chai');
var crypto = require('crypto');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var GridFs = require('../../lib/gridfs');

// init chai api
var expect = chai.expect;
chai.use(require("chai-as-promised"));

var db;

function make_callback(resolve, reject) {
    return function(err) {
        if (err) {
            reject(err);
        } else {
            var args = _.rest(arguments);
            resolve.apply(null, args.length > 1 ? [args] : args);
        }
    };
}

function make_promise(fun) {
    var args = _.rest(arguments);
    return new Promise(function(resolve, reject) {
        fun.apply(null, args.concat(make_callback(resolve, reject)));
    });
}

function clean_up() {
    var files = db.collection('fs.files');
    var chunks = db.collection('fs.chunks');
    return Promise.all([
        make_promise(files.drop.bind(files)),
        make_promise(chunks.drop.bind(chunks))
    ]);
}

function file_open(file) {
    return new Promise(function(resolve, reject) {
        file.open(make_callback(resolve, reject));
    });
}

function file_close(file) {
    return new Promise(function(resolve, reject) {
        file.close(make_callback(resolve, reject));
    });
}

function file_write(file, data) {
    return new Promise(function(resolve, reject) {
        file.write(data || new Buffer(0), make_callback(resolve, reject));
    });
}

function file_read(file, buffer) {
    return new Promise(function(resolve, reject) {
        if (buffer) {
            file.read(buffer.length, buffer, make_callback(resolve, reject));
        } else {
            file.read(make_callback(resolve, reject));
        }
    });
}

function file_create(file_id, data) {
    return file_open(new mongo.GridStore(db, file_id, 'w', {root: 'fs'}))
        .then(function(file) {
            return file_write(file, data).then(function() {
                return file;
            });
        })
        .then(file_close);
}

function file_exist(file_id, root) {
    return new Promise(function(resolve, reject) {
        mongo.GridStore.exist(
            db,
            file_id,
            root ? root : 'fs',
            make_callback(resolve, reject)
        );
    });
}

function check_written_data(file_id, data) {
    var file, buffer;
    return file_open(new mongo.GridStore(db, file_id, 'r'))
        .then(function(file_) {
            file = file_;
            return file_read(file);
        })
        .then(function(buffer_) {
            buffer = buffer_;
            return file_close(file);
        })
        .then(function() {
            return buffer.equals(data);
        });
}

before('Connect to mongodb', function(done) {
    mongo.MongoClient.connect(
        'mongodb://test:test@127.0.0.1:27017/test',
        {native_parser: true},
        function(err, _db) {
            if (err) {
                return done(err);
            }
            db = _db;
            done(err);
        }
    );
});

after('Clean up', function() {
    return clean_up();
});

describe('GridFs(mongo, db, root)', function() {
    var gfs;
    before('Create a GridFs instance', function() {
        gfs = new GridFs(mongo, db, 'fs');
    });
    it('should have a `mongo` attribute equals to the one it get passed',
        function() {
            expect(gfs.mongo).to.equal(mongo);
        }
    );
    it('should have a `db` attribute equals to the one it get passed',
        function() {
            expect(gfs.db).to.equal(db);
        }
    );
    it('should have a `root` attribute equals to the one it get passed',
        function() {
            expect(gfs.root).to.equal('fs');
        }
    );
});

describe('GridFs#open(file_id, \'w\', cb)', function() {
    it('should create a file when passing a path string and `\'w\'` flag',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return expect(make_promise(gfs.open.bind(gfs), id.toString(), 'w')
                .then(file_close)
                .then(file_exist.bind(null, id, 'fs'))
            ).to.eventually.be.true;
        }
    );
    it('should create a file when passing an ObjectId and `\'w\'` flag',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return expect(make_promise(gfs.open.bind(gfs), id, 'w')
                .then(file_close)
                .then(file_exist.bind(null, id, 'fs'))
            ).to.eventually.be.true;
        }
    );
});

describe('GridFs#open(file_id, \'r\', cb)', function() {
    it('should open an existing file when passing a string and `\'r\'` flag',
        function() {
            var id = new mongo.ObjectId();
            return expect(file_create(id)
                .then(function() {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.open.bind(gfs), id.toString(), 'r');
                })
            ).to.eventually.be.fulfilled;
        }
    );
    it('should open an existing file when passing a ObjectId and `\'r\'` flag',
        function() {
            var id = new mongo.ObjectId();
            return expect(file_create(id)
                .then(function() {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.open.bind(gfs), id, 'r');
                })
            ).to.eventually.be.fulfilled;
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a write opened file without error',
        function() {
            return expect(file_open(new mongo.GridStore(db, new mongo.ObjectId(), 'w', {root: 'fs'}))
                .then(function(file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.close.bind(gfs), file);
                })
            ).to.eventually.be.fulfilled;
    });
    it('should close a read opened file without error',
        function() {
            var id = new mongo.ObjectId();
            return expect(file_create(id)
                .then(function() {
                    return file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}));
                })
                .then(function(file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.close.bind(gfs.close.bind(gfs), file));
                })
            ).to.eventually.be.fulfilled;
    });
});

describe('GridFs#write(fd, buffer, offset, len, pos, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    it('should write to a writable opened file without error',
        function() {
            var file;
            return file_open(new mongo.GridStore(db, id, 'w', {root: 'fs'}))
                .then(function(file_) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    file = file_;
                    return make_promise(gfs.write.bind(gfs), file, data, 0, data.length);
                })
                .then(function(result) {
                    return (
                        expect(result).to.be.an('array')
                        && expect(result[0]).to.be.a('number')
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                    );
                })
                .then(function() {
                    return file_close(file);
                });
        }
    );
    it('should write the data correctly',
        function() {
            return expect(check_written_data(id, data)).to.be.eventually.true;
        }
    );
    it('should fail when trying to write in a read opened file',
        function() {
            return file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}))
                .then(function(file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return expect(
                        make_promise(gfs.write.bind(gfs), file, data, 0, data.length)
                    ).to.eventually.be.rejected;
                });
    });
});

describe('GridFs#read(fd, buffer, offset, len, pos, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    before('Open file for readding', function() {
        return file_create(id, data);
    });
    it('should read from a readable opened file and store the result in the given buffer',
        function() {
            var file;
            var read;
            var buffer;
            return file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}))
                .then(function(file_) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    read = gfs.read.bind(gfs);
                    file = file_;
                })
                .then(function() {
                    buffer = new Buffer(128);
                    return make_promise(read, file, buffer, 0, buffer.length);
                })
                .then(function(result) {
                    return (
                        expect(result).to.be.an('array')
                        && expect(result[0]).to.be.a('number')
                        && expect(result[0]).to.equal(128)
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                        && expect(result[1] === buffer).to.be.true
                        && expect(result[1].equals(data.slice(0, 128))).to.be.true
                    );
                })
                .then(function() {
                    buffer = new Buffer(128);
                    return make_promise(read, file, buffer, 0, buffer.length);
                })
                .then(function(result) {
                    return (
                        expect(result).to.be.an('array')
                        && expect(result[0]).to.be.a('number')
                        && expect(result[0]).to.equal(128)
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                        && expect(result[1] === buffer).to.be.true
                        && expect(result[1].equals(data.slice(128, 256))).to.be.true
                    );
                })
                .then(function() {
                    buffer = new Buffer(256 + 128);
                    return make_promise(read, file, buffer, 0, buffer.length);
                })
                .then(function(result) {
                    return (
                        expect(result).to.be.an('array')
                        && expect(result[0]).to.be.a('number')
                        && expect(result[0]).to.equal(256)
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                        && expect(result[1] === buffer).to.be.true
                        && expect(result[1].slice(0, result[0]).equals(data.slice(256))).to.be.true
                    )
                })
                .then(function() {
                    buffer = new Buffer(256 + 128);
                    return make_promise(read, file, buffer, 0, buffer.length);
                })
                .then(function(result) {
                    return (
                        expect(result).to.be.an('array')
                        && expect(result[0]).to.be.a('number')
                        && expect(result[0]).to.equal(0)
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                    )
                })
        }
    );
});

describe('GridFs#writeFile(path, buffer, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    it('should write data to a file given its path without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            return make_promise(gfs.writeFile.bind(gfs), id, data);
        }
    );
    it('should write the data correctly', function() {
        return expect(check_written_data(id, data)).to.be.eventually.true;
    });
});

describe.skip('GridFs#appendFile(path, buffer, cb)', function() {
    var data1 = crypto.randomBytes(512);
    var data2 = crypto.randomBytes(512);

    var id = new mongo.ObjectId();
    before('Create file', function(done) {
        file_create(id, data1, done);
    });
    it('should append data to a file given its path without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            return make_promise(gfs.appendFile.bind(gfs), 'id', data2);
        }
    );
    it('should append the data correctly', function() {
        return expect(check_written_data(id, Buffer.concat([data1, data2]))).to.be.eventually.true;
    });
});

describe('GridFs#readFile(path, buffer, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    before('Create file', function() {
        return file_create(id, data);
    });
    it('should read the content of a file given its path without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            return make_promise(gfs.readFile.bind(gfs), id)
                .then(function(read_data) {
                    return expect(read_data.equals(data)).to.be.true;
                });
        }
    );
});
