require('./server');

var net = require('net');

var SERVER_HOST = '192.168.1.180';
var SERVER_PORT = 27017;

var fromScoket = new net.Socket();
var toScoket = new net.Socket();

toScoket.setEncoding('binary');
fromScoket.setEncoding('binary');
fromScoket.connect(8002, '127.0.0.1', () => {

    console.log('连接上外网服务器');


    toScoket.connect(SERVER_PORT, SERVER_HOST, () => {
        console.log('连接上目标服务器')
        //交换流
        fromScoket.pipe(toScoket);
        toScoket.pipe(fromScoket);
    });

    var toClose = (error) => {
        console.log('to socket close.', error)
        toScoket.end();
        fromScoket.end();
    }
    toScoket.on('data', data => console.log(data))
    toScoket.on('close', toClose);
    toScoket.on('end', toClose);
    toScoket.on('error', toClose);

});

var fromClose = () => {
    console.log('from socket close.')
    fromScoket.end();
    toScoket.end();
}
fromScoket.on('close', fromClose);
fromScoket.on('end', fromClose);
fromScoket.on('error', fromClose);
