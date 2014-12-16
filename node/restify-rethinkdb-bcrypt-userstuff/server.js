var restify = require('restify'); //api http://mcavage.me/node-restify/
var r = require('rethinkdb'); // api http://www.rethinkdb.com/api/javascript/
var bcrypt = require('bcrypt'); // api https://www.npmjs.com/package/bcrypt
var assert = require('assert');

var userDB = require('./userstuff.js');

var server = restify.createServer();

//active POST requests
server.use(restify.bodyParser({ mapParams: false }));

server.get('/register/:username/:password', userDB.registerUser);
server.post('/register', userDB.registerUser);
server.get('/login/:username/:password', userDB.loginUser);
server.post('/login', userDB.loginUser);


server.listen(18080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
