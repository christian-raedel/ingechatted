'use strict';

var debug = require('debug')('ingechatted'),
    redis = require('redis'),
    WebSocketServer = require('websocket').server,
    express = require('express'),
    uuid = require('uuid'),
    argv = require('optimist').argv,
    Manager = require('./src/manager'),
    MessageParser = require('./src/message-parser');

var manager = new Manager('inge', __dirname + '/config/models', {
        redis: redis.createClient(argv['redis-port'] || 6437, argv['redis-host'] || '127.0.0.1')
    }),
    parser = new MessageParser(manager);

var app = express();
app.use(express.static(__dirname + '/public'));
app.listen(argv['port'] || 3000, function() {
    debug('server listen on ' + (argv['port'] || 3000));
});

var server = new WebSocketServer({ 
  httpServer: app,
  autoAcceptConnections: true
});
server.on('connect', function(connection) {
    console.log(req);
    connection.id = uuid.v4();
    manager.connections.add(connection, function(err, connection) {
        if (err) {
            debug(err.message);
        }
        debug('(' + manager.connections.length + ') clients connected');
        parser.request(connection, 'AUTH');

        connection.on('close', function() {
            manager.connections.remove('id', connection.id, function(err, count) {
                if (err) {
                    debug(err.message);
                }
                debug('(' + count + '/' + manager.connections.length + ') clients disconnected');
            });
        });

        connection.on('message', function(data) {
            if (data.type === 'utf8') {
                debug('message received: ' + data.utf8Data);
                try {
                    parser.parse(JSON.parse(data.utf8Data), function(err, next) {
                        if (err) {
                            throw err;
                        }
                        if (parser.MESSAGETYPES.hasOwnProperty(next)) {
                            debug(next);
                        }
                    });
                } catch (err) {
                    debug(err.message);
                }
            }
        });
    });
});
