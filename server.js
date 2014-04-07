'use strict';

var debug = require('debug')('ingechatted'),
    redis = require('redis'),
    WebSocketServer = require('ws').Server,
    http = require('http'),
    express = require('express'),
    app = express(),
    argv = require('optimist').argv,
    Manager = require('./src/manager'),
    MessageParser = require('./src/message-parser');

var manager = new Manager('inge', __dirname + '/config/models', {
        redis: redis.createClient(argv['redis-port'] || 6437, argv['redis-host'] || '127.0.0.1'),
        debug: {
            users: [
                { name: 'ingelise', password: 's3cr3t26' }
            ]
        }
    }),
    parser = new MessageParser(manager);

app.configure(function() {
    app.use('/', express.logger());
    app.use('/', express.static(__dirname + '/public'));
});

var server = http.createServer(app),
    port = argv['port'] || 3000;

server.listen(port, function() {
    debug('server listen on port [' + port + ']');
});

var clients = [],
    wss = new WebSocketServer({ server: server });

wss.on('connection', function(ws) {
    clients.push(ws);
    debug('(+1/' + clients.length + ') client connected');
    parser.MESSAGETYPES.AUTH.request(ws);

    ws.on('close', function() {
        clients = clients.splice(ws, 1);
        debug('(-1/' + clients.length + ') client disconnected');
    });

    ws.on('message', function(data) {
        try {
            parser.parse(ws, JSON.parse(data), function (err, next) {
                if (err) {
                    throw err;
                }
                if (parser.MESSAGETYPES.hasOwnProperty(next)) {
                    debug('[invoke next action] ' + next);
                }
            });
        } catch (err) {
            debug(err.message);
        }
    });
});
wss.on('error', function(err) {
    debug(err.message);
});
