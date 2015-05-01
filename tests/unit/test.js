var _ = require('underscore');
var async = require('async');
var chai = require('chai');
var concat = require('concat-stream');
var crypto = require('crypto');
var fs = require('fs');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var GridFs = require('../../lib/gridfs');
var temp = require('temp').track();

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

function gs_file_open(file) {
    return new Promise(function(resolve, reject) {
        file.open(make_callback(resolve, reject));
    });
}

function gs_file_close(file) {
    return new Promise(function(resolve, reject) {
        file.close(make_callback(resolve, reject));
    });
}

function gs_file_write(file, data) {
    return new Promise(function(resolve, reject) {
        file.write(data || new Buffer(0), make_callback(resolve, reject));
    });
}

function gs_file_read(file, buffer) {
    return new Promise(function(resolve, reject) {
        if (buffer) {
            file.read(buffer.length, buffer, make_callback(resolve, reject));
        } else {
            file.read(make_callback(resolve, reject));
        }
    });
}

function gs_file_create(file_id, data) {
    return gs_file_open(new mongo.GridStore(db, file_id, 'w', {root: 'fs'}))
        .then(function(file) {
            return gs_file_write(file, data).then(function() {
                return file;
            });
        })
        .then(gs_file_close);
}

function gs_file_exist(file_id, root) {
    return new Promise(function(resolve, reject) {
        mongo.GridStore.exist(
            db,
            file_id,
            root ? root : 'fs',
            make_callback(resolve, reject)
        );
    });
}

function gs_check_written_data(file_id, data) {
    var file, buffer;
    return gs_file_open(new mongo.GridStore(db, file_id, 'r'))
        .then(function(file_) {
            file = file_;
            return gs_file_read(file);
        })
        .then(function(buffer_) {
            buffer = buffer_;
            return gs_file_close(file);
        })
        .then(function() {
            return buffer.equals(data);
        });
}

function fs_file_create(data) {
    var temp_file_info;
    return make_promise(temp.open.bind(temp), {dir: __dirname})
        .then(function(info) {
            temp_file_info = info;
            return make_promise(fs.write.bind(fs), temp_file_info.fd, data, 0, data.length);
        })
        .then(function() {
            return make_callback(fs.close.bind(fs), temp_file_info.fd);
        })
        .then(function() {
            return temp_file_info.path;
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
    it('should create a file when passing a path string',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return expect(make_promise(gfs.open.bind(gfs), id.toString(), 'w')
                .then(gs_file_close)
                .then(gs_file_exist.bind(null, id, 'fs'))
            ).to.eventually.be.true;
        }
    );
    it('should create a file when passing an ObjectId',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return expect(make_promise(gfs.open.bind(gfs), id, 'w')
                .then(gs_file_close)
                .then(gs_file_exist.bind(null, id, 'fs'))
            ).to.eventually.be.true;
        }
    );
    it('should create a file when passing a path string and options',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            var content_type = 'image/png';
            var metadata = {
                foo: 'foo',
                bar: 'bar'
            };
            return make_promise(gfs.open.bind(gfs), id.toString(), 'w', {
                content_type: content_type,
                metadata: metadata
            })
                .then(gs_file_close)
                .then(gs_file_open.bind(null, new mongo.GridStore(db, id, 'r')))
                .then(function(file) {
                    return (
                        expect(file.contentType).to.equal(content_type)
                        && expect(file.metadata).to.deep.equal(metadata)
                    );
                });
        }
    );
    it('should create a file when passing an ObjectId and options',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            var content_type = 'image/png';
            var metadata = {
                foo: 'foo',
                bar: 'bar'
            };
            return make_promise(gfs.open.bind(gfs), id, 'w', {
                content_type: content_type,
                metadata: metadata
            })
                .then(gs_file_close)
                .then(gs_file_open.bind(null, new mongo.GridStore(db, id, 'r')))
                .then(function(file) {
                    return (
                        expect(file.contentType).to.equal(content_type)
                        && expect(file.metadata).to.deep.equal(metadata)
                    );
                });
        }
    );
});

describe('GridFs#open(file_id, \'r\', cb)', function() {
    it('should open an existing file when passing a string',
        function() {
            var id = new mongo.ObjectId();
            return expect(gs_file_create(id)
                .then(function() {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.open.bind(gfs), id.toString(), 'r');
                })
            ).to.eventually.be.fulfilled;
        }
    );
    it('should open an existing file when passing a ObjectId',
        function() {
            var id = new mongo.ObjectId();
            return expect(gs_file_create(id)
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
            return expect(gs_file_open(new mongo.GridStore(db, new mongo.ObjectId(), 'w', {root: 'fs'}))
                .then(function(file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.close.bind(gfs), file);
                })
            ).to.eventually.be.fulfilled;
    });
    it('should close a read opened file without error',
        function() {
            var id = new mongo.ObjectId();
            return expect(gs_file_create(id)
                .then(function() {
                    return gs_file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}));
                })
                .then(function(file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.close.bind(gfs.close.bind(gfs), file));
                })
            ).to.eventually.be.fulfilled;
    });
});

describe('GridFs#unlink(path, cb)', function() {
    it('should remove an existing file without error when passing a string',
        function() {
            var id = new mongo.ObjectId();
            return gs_file_create(id, crypto.randomBytes(512))
                .then(function() {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.unlink.bind(gfs), id.toString());
                })
                .then(function() {
                    return expect(gs_file_exist(id)).to.eventually.be.false;
                })
        }
    );
    it('should remove an existing file without error when passing an ObjectId',
        function() {
            var id = new mongo.ObjectId();
            return gs_file_create(id, crypto.randomBytes(512))
                .then(function() {
                    var gfs = new GridFs(mongo, db, 'fs');
                    return make_promise(gfs.unlink.bind(gfs), id);
                })
                .then(function() {
                    return expect(gs_file_exist(id)).to.eventually.be.false;
                })
        }
    );
    it('should remove a non existing file without error when passing an string',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return make_promise(gfs.unlink.bind(gfs), id.toString())
                .then(function() {
                    return expect(gs_file_exist(id)).to.eventually.be.false;
                })
        }
    );
    it('should remove a non existing file without error when passing an ObjectId',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            return make_promise(gfs.unlink.bind(gfs), id)
                .then(function() {
                    return expect(gs_file_exist(id)).to.eventually.be.false;
                })
        }
    );
})

describe('GridFs#write(fd, buffer, offset, len, pos, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    it('should write to a writable opened file without error',
        function() {
            var file;
            return gs_file_open(new mongo.GridStore(db, id, 'w', {root: 'fs'}))
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
                    return gs_file_close(file);
                });
        }
    );
    it('should write the data correctly',
        function() {
            return expect(gs_check_written_data(id, data)).to.be.eventually.true;
        }
    );
    it('should fail when trying to write in a read opened file',
        function() {
            return gs_file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}))
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
        return gs_file_create(id, data);
    });
    it('should read from a readable opened file and store the result in the given buffer',
        function() {
            var file;
            var read;
            var buffer;
            return gs_file_open(new mongo.GridStore(db, id, 'r', {root: 'fs'}))
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
                        && expect(result[0]).to.equal(0)
                        && expect(result[1]).to.be.an.instanceof(Buffer)
                    );
                });
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
        return expect(gs_check_written_data(id, data)).to.be.eventually.true;
    });
});

describe.skip('GridFs#appendFile(path, buffer, cb)', function() {
    var data1 = crypto.randomBytes(512);
    var data2 = crypto.randomBytes(512);

    var id = new mongo.ObjectId();
    before('Create file', function(done) {
        gs_file_create(id, data1, done);
    });
    it('should append data to a file given its path without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            return make_promise(gfs.appendFile.bind(gfs), 'id', data2);
        }
    );
    it('should append the data correctly', function() {
        return expect(gs_check_written_data(id, Buffer.concat([data1, data2]))).to.be.eventually.true;
    });
});

describe('GridFs#readFile(path, buffer, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    before('Create file', function() {
        return gs_file_create(id, data);
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

describe('GridFs#createReadStream(path)', function() {
    var data = crypto.randomBytes(4096);
    var id = new mongo.ObjectId();
    before('Create file', function() {
        return gs_file_create(id, data);
    });
    it('should create a readable stream without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var istream = gfs.createReadStream(id);
            expect(istream.constructor.super_).to.equal(require('stream').Duplex);
            expect(istream.gs.mode).to.equal('r');
        }
    );
    it('should read from stream without error',
        function() {
            return (new Promise(function(resolve, reject) {
                var gfs = new GridFs(mongo, db, 'fs');
                gfs.createReadStream(id)
                    .once('error', reject)
                    .pipe(concat(resolve));
            }))
            .then(function(buffer) {
                return expect(buffer.equals(data)).to.be.true;
            });
        }
    );
});

describe('GridFs#createWriteStream(path)', function() {
    var data = crypto.randomBytes(4096);
    var id = new mongo.ObjectId();
    it('should create a writable stream without error',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            var ostream = gfs.createWriteStream(id);
            expect(ostream.constructor.super_).to.equal(require('stream').Duplex);
            expect(ostream.gs.mode).to.equal('w');
        }
    );
    it('should write to stream without error',
        function() {
            return fs_file_create(data)
                .then(function(path) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    var istream = fs.createReadStream(path);
                    var ostream = gfs.createWriteStream(id);

                    return new Promise(function(resolve, reject) {
                        ostream
                            .once('end', resolve)
                            .once('error', reject);
                        istream.pipe(ostream);
                    });
                })
                .then(function() {
                    return expect(gs_check_written_data(id, data)).to.be.eventually.true;
                });
        }
    );
});

describe('GridFs#readdir()',  function() {
    it('should list all the file of a gridfs collection',
        function() {
            var gfs = new GridFs(mongo, db, 'fs');
            return expect(make_promise(gfs.readdir.bind(gfs))).to.eventually.be.fulfilled;
        });
});
