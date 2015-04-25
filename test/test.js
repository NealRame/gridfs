var assert = require('assert');
var async = require('async');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var GridFs = require('../lib/gridfs');

// fixtures
var db, gfs, id1, file1;

function clean_up(done) {
    var files = db.collection('fs.files');
    var chunks = db.collection('fs.chunks');

    async.series([
        function(next) {
            files.drop(next);
        },
        function(next) {
            chunks.drop(next);
        }
    ], done);
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
            // clean_up(done);
        }
    );
});

after('Clean up', function(done) {
    clean_up(done);
});

describe('GridFs(mongo, db, root)', function() {
    before('Create a GridFs instance', function() {
        gfs = new GridFs(mongo, db, 'fs');
    });

    it('should have a `mongo` attribute equals to the one it get passed',
        function() {
            assert.equal(mongo, gfs.mongo);
        }
    );
    it('should have a `db` attribute equals to the one it get passed',
        function() {
            assert.equal(db, gfs.db);
        }
    );
    it('should have a `root` attribute equals to the one it get passed',
        function() {
            assert.equal('fs', gfs.root);
        }
    );
});

describe('GridFs#open(string, \'w\', cb)', function() {
    before('Create a file id', function() {
        id1 = new mongo.ObjectId();
    });

    it('should create a file when passing a path string and `\'w\'` flag',
        function(done) {
            gfs.open(id1.toString(), 'w', function(err, _file) {
                if (err) {
                    done(err);
                }
                file1 = _file;
                done();
            });
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a write opened file without error',
        function(done) {
            gfs.close(file1, done);
        }
    );
});

describe('GridFs#open(string, \'r\', cb)', function() {
    it('should open an existing file when passing a path string and `\'r\'` flag',
        function(done) {
            gfs.open(id1.toString(), 'r', function(err, _file) {
                if (err) {
                    done(err);
                }
                file1 = _file;
                done();
            });
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a read opened file without error',
        function(done) {
            gfs.close(file1, done);
        }
    );
});

describe('GridFs#open(id, \'w\', cb)', function() {
    before('Create a file id', function() {
        id1 = new mongo.ObjectId();
    });

    it('should create a file when passing an ObjectId and `\'w\'` flag',
        function(done) {
            gfs.open(id1, 'w', function(err, _file) {
                if (err) {
                    done(err);
                }
                file1 = _file;
                done();
            });
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a write opened file without error',
        function(done) {
            gfs.close(file1, done);
        }
    );
});

describe('GridFs#open(id, \'r\', cb)', function() {
    it('should open an existing file when passing a ObjecId and `\'r\'` flag',
        function(done) {
            gfs.open(id1, 'r', function(err, _file) {
                if (err) {
                    done(err);
                }
                file1 = _file;
                done();
            });
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a write opened file without error',
        function(done) {
            gfs.close(file1, done);
        }
    );
});

describe('GridFs#write(fd, buffer, offset, len, pos, cb)', function() {
    before('Open file for writing', function(done) {
        gfs.open(id1, 'w', function(err, _file) {
            file1 = _file;
            done(err);
        });
    });

    after('Close file', function(done) {
        gfs.close(file1, done);
    });

    it('should write in a writable opened file without error.', function(done) {
        var buf = new Buffer('test');
        gfs.write(file1, buf, 0, buf.length, null, function(err, len, buffer) {
            try {
                if (err) {
                    throw err;
                }
                assert.equal(len, buf.length);
                assert.equal(len, buffer.length);
                done();
            } catch(err) {
                done(err);
            }
        });
    });
});
