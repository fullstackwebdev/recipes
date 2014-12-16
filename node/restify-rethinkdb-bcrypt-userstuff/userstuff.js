var r = require('rethinkdb'); // api http://www.rethinkdb.com/api/javascript/
var bcrypt = require('bcrypt'); // api https://www.npmjs.com/package/bcrypt
var assert = require('assert');

var exports = module.exports = {};

var conn;

r.connect({
        host: 'localhost',
        port: 28015,
        db: 'test',
        authKey: ''
    },
    function(err, _conn) {
        conn = _conn;
        console.log("Connected? %s or err %s", _conn, err);
    });



findUserByUsername = function(_username, callback) {
    console.log(_username);
    r.table('accounts').filter({
        username: _username
    }).limit(1).run(conn, function(err, cursor) {
        if (err) {
            console.log("Error " + err);
            callback(err);
        } else {
            cursor.toArray(function(err, results) {
                if(err) throw err;
                if(results.length == 0) {
                    console.log("Not found");
                    callback(null,null)
                } else {
                    console.log("Found" + results);
                    callback(null, results[0]);
                }
            })

        }
    });
};

module.exports.registerUser = function(req, res, next) {
    //params for get, body for POST
    username = req.params.username || req.body.username;
    password = req.params.password || req.body.password;

    assert(username);
    assert(password);
    //check if user exists

    findUserByUsername(username, function(err, username) {
        if (err) throw err;
        if (username) {
            res.send("User already exists");
        } else {
            bcrypt.hash(password, 10, function(err, hash) {
                if(err) throw err;
                assert(hash);
                r.table('accounts').insert({
                    username: username,
                    hash: hash,
                }).run(conn, function(err, cursor) {
                    if(err) throw err;
                    assert(cursor);
                    res.send("Saved");
                });
            });
        }
    })
    next();
};


module.exports.loginUser = function (req, res, next) {
    //params for get, body for POST
    username = req.params.username || req.body.username;
    password = req.params.password || req.body.password;

    assert(username);
    assert(password);
    findUserByUsername(username, function (err, user) {
        if(err) throw err;
        if(!user) {
            res.send("Invalid username or password");
        } else {
            assert(user['hash']);
            bcrypt.compare(password, user['hash'], function(err, results) {
                if(err) throw err;
                assert(results);
                if(results) {
                    res.send("Successfully logged in");
                } else {
                    res.send("Invalid username or password");
                }
            });

        }

    });
    next();
}

return module.exports;