const net = require('net');

var HOST = '192.168.1.180';
var PORT = 27017;

var SERVER_HOST = '127.0.0.1';
var SERVER_PORT = 8888;

let server = new net.Socket();
server.connect({host: SERVER_HOST, port: SERVER_PORT}, function () {
    console.log('connect server %s success.', SERVER_PORT);
    let target = new net.Socket();
    target.connect({host: HOST, port: PORT}, function () {
        console.log(`connect ${HOST}:${PORT} success.`);

        target.on('data', data => server.write(data));
        server.on('data', data => target.write(data));
    });
    target.on('error', err => console.log('target error', err))

});
server.on('error', err => console.log('server error', err))