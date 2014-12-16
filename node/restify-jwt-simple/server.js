var restify = require('restify');
var jwt = require('jwt-simple');


var payload = {
    foo: 'bar'
};
var secret = 'xxx';

function tokenResponder(req, res, next) {
    if (req.username == 'admin') {
        var token = jwt.encode(payload, secret);

        res.json({
            token: token
        });
        next();
    } else {
        res.statusCode = 401; // Force them to retry authentication
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.end('<html><body>You shall not pass</body></html>');
    }
    var auth = req.headers['authorization'];
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.end('need creds son');

}

function auth(req, res, next) {
    token = req.headers.token;
    var decoded = jwt.decode(token, secret);
    console.log("Decoded :" + JSON.stringify(decoded)); //=> { foo: 'bar' }*/
    //if()
    next();
}

function myApi(req,res,next) {

    res.send("you're done son ");
    next();
}

var server = restify.createServer();

server.use(restify.authorizationParser());

server.post('/token/:name', tokenResponder);
server.get('/token/:name', tokenResponder);

server.post('/api/:func', auth, myApi);

server.listen(3080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

////////// Sample client
var client = restify.createJsonClient({
    url: 'http://localhost:3080',
    version: '*'
});
client.basicAuth('admin', '');

client.get('/token/:bar', function(err, req, res, obj) {
    console.log('%j', obj['token']);

    var client2 = restify.createJsonClient({
        url: 'http://localhost:3080',
        version: '*',
        headers: obj
    });

    client2.post('/api/bar', {
        hello: 'world',
    }, function(err, req, res, obj) {
        console.log('%d -> %j', res.statusCode, res.headers);
        console.log('%j', obj);
    });

});
