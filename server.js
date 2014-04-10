'use strict';

var config = require('./config/' + (process.env.NODE_ENV === 'production' ? 'production.json' : 'development.json')),
    debug = require('debug')(config.name),
    redis = require('redis'),
    WebSocketServer = require('ws').Server,
    wsExt = require('./lib/websocket-extensions'),
    http = require('http'),
    express = require('express'),
    app = express(),
    createManager = require('./lib/manager').createManager,
    Functions = require('./lib/functions');

var manager = createManager(__dirname + '/config/models.json', {
        redis: redis.createClient(config.redis.port || 6437, config.redis.host || '127.0.0.1'),
        debug: {
            users: [
                { name: 'ingelise', password: 's3cr3t26' }
            ],
            channels: [
                { name: 'ingeworld' }
            ]
        }
    }),
    functions = new Functions(manager);

app.configure(function() {
    app.use('/', express.logger());
    app.use('/', express.static(__dirname + '/public'));
});

var server = http.createServer(app),
    port = config.port || 3000;

server.listen(port, function() {
    debug('server listen on port [' + port + ']');
});

var clients = [],
    wss = new WebSocketServer({ server: server });

wss.on('connection', function(ws) {
    clients.push(ws);
    debug('(+1/' + clients.length + ') client connected');

    var timeout = setTimeout(function() {
        ws.push('welcome', 'Welcome to "ingechatted"! Have fun...');
        clearTimeout(timeout);
    }, 500);

    ws.on('close', function() {
        clients = clients.splice(ws, 1);
        debug('(-1/' + clients.length + ') client disconnected');
    });

    ws.on('message', function(data) {
        ws.parse(data);
    });

    ws.on('parse', function(message, args) {
        try {
            var fnName = message.shift();
            functions.callFunction(fnName, message);
        } catch (err) {
            debug(err.message);
        }
    });

  ws.on('error', function(err) {
    if(err) {
      debug('websocket error: ' + err.message);
    }
  });

  functions.on('error', function(err) {
        if (err) {
            ws.push(err.message);
            debug('functions error: ' + err.message);
        }
    });

    functions.on('finish', function() {
        if (arguments.length > 0) {
            ws.push.call(this, arguments);
        }
    });
});

wss.on('error', function(err) {
    debug(err.message);
});
