var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var crypto = require('crypto');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var GridFs = require('../lib/gridfs');

// fixtures
var db, gfs;

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

function create_file(file_id, data, done) {
    if (_.isFunction(data)) {
        done = data;
        data = null;
    }
    (new mongo.GridStore(db, file_id, 'w', {
        root: 'fs'
    })).open(function(err, file) {
        if (err) {
            return done(err);
        }
        if (data) {
            file.write(data, function(err) {
                if (err) {
                    return done(err);
                }
                file.close(done);
            });
        } else {
            file.close(done);
        }
    });
}

function check_written_data(file_id, data, done) {
    (new mongo.GridStore(db, file_id, 'r')).open(function(err, file) {
        if (err) {
            return done(err);
        }
        file.read(function(err, buffer) {
            if (err) {
                return done(err);
            }
            try {
                assert(data.equals(buffer));
                file.close(done);
            } catch(err) {
                done(err);
            }
        });
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

after('Clean up', function(done) {
    clean_up(done);
});

describe('GridFs(mongo, db, root)', function() {
    var gfs;
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

describe('GridFs#open(file_id, \'w\', cb)', function() {
    it('should create a file when passing a path string and `\'w\'` flag',
        function(done) {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            gfs.open(id.toString(), 'w', function(err, file) {
                if (err) {
                    return done(err);
                }
                file.close(function(err) {
                    if (err) {
                        return done(err);
                    }
                    (new mongo.GridStore(db, id, 'r')).open(done);
                });
            });
        }
    );
    it('should create a file when passing an ObjectId and `\'w\'` flag',
        function(done) {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            gfs.open(id, 'w', function(err, file) {
                if (err) {
                    return done(err);
                }
                file.close(function(err) {
                    if (err) {
                        return done(err);
                    }
                    (new mongo.GridStore(db, id, 'r')).open(done);
                });
            });
        }
    );
});

describe('GridFs#open(file_id, \'r\', cb)', function() {
    it('should open an existing file when passing a string and `\'r\'` flag',
        function(done) {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            create_file(id, function(err) {
                if (err) {
                    return done(err);
                }
                gfs.open(id.toString(), 'r', done);
            });
        }
    );
    it('should open an existing file when passing a ObjectId and `\'r\'` flag',
        function(done) {
            var gfs = new GridFs(mongo, db, 'fs');
            var id = new mongo.ObjectId();
            create_file(id, function(err) {
                if (err) {
                    return done(err);
                }
                gfs.open(id, 'r', done);
            });
        }
    );
});

describe('GridFs#close(file, cb)', function() {
    it('should close a write opened file without error',
        function(done) {
            var id = new mongo.ObjectId();
            (new mongo.GridStore(db, id, 'w', {
                root: 'fs'
            })).open(function(err, file) {
                var gfs = new GridFs(mongo, db, 'fs');
                gfs.close(file, done);
            });

        }
    );
    it('should close a read opened file without error',
        function(done) {
            var id = new mongo.ObjectId();
            create_file(id, function(err) {
                if (err) {
                    return done(err);
                }
                (new mongo.GridStore(db, id, 'r', {
                    root: 'fs'
                })).open(function(err, file) {
                    var gfs = new GridFs(mongo, db, 'fs');
                    gfs.close(file, done);
                });
            });
        }
    );
});

describe('GridFs#write(fd, buffer, offset, len, pos, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    it('should write to a writable opened file without error', function(done) {
        var gfs = new GridFs(mongo, db, 'fs');
        gfs.openAsync(id, 'w')
            .then(function(file) {
                gfs.write(file, data, 0, data.length, function(err, len, buf) {
                    if (err) {
                        done(err);
                    } else {
                        try {
                            assert(_.isNumber(len));
                            assert.equal(data.length, len);
                            assert.equal(data.length, buf.length);
                            file.close(done);
                        } catch (err) {
                            done(err);
                        }
                    }
                });
            })
            .catch(done);
    });
    it('should write the data correctly', function(done) {
        check_written_data(id, data, done);
    });
    it('should fail when trying to write in a read opened file', function(done) {
        var gfs = new GridFs(mongo, db, 'fs');
        gfs.openAsync(id, 'r')
            .then(function(file) {
                gfs.write(file, data, 0, data.length, function(err, len, buf) {
                    try {
                        assert(! (_.isUndefined(err) || _.isNull(err)));
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            })
            .catch(done);
    });
});

describe('GridFs#read(fd, buffer, offset, len, pos, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    before('Open file for readding', function(done) {
        create_file(id, data, done);
    });
    it('should read from a readable opened file without error', function(done) {
        var gfs = new GridFs(mongo, db, 'fs');
        gfs.openAsync(id, 'r')
            .then(function(file) {
                var read_data = new Buffer(128);
                gfs.read(file, read_data, 0, 128, 0, function(err, len, buffer) {
                    if (err) {
                        return done(err);
                    }
                    try {
                        assert.equal(read_data, buffer);
                        assert.equal(read_data.length, len);
                        assert(data.slice(0, 128).equals(read_data));
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
            })
            .catch(done);
    });
});

describe('GridFs#writeFile(path, buffer, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    it('should write data to a file given its path without error', function(done) {
        var gfs = new GridFs(mongo, db, 'fs');
        gfs.writeFile(id.toString(), data, function(err) {
            done(err);
        });
    });
    it('should write the data correctly', function(done) {
        check_written_data(id, data, done);
    });
});

describe.skip('GridFs#appendFile(path, buffer, cb)', function() {
    var data = crypto.randomBytes(512);
    var id = new mongo.ObjectId();
    before('Create file', function(done) {
        create_file(id, data, done);
    })
    it('should append data to a file given its path without error', function(done) {
        var gfs = new GridFs(mongo, db, 'fs');
        gfs.appendFile(id.toString(), data, function(err) {
            done(err);
        });
    });
    it('should write the data correctly', function(done) {
        check_written_data(id, Buffer.concat([data, data]), done);
    });
});
