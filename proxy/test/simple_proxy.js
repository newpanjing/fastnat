/**
 * 简单的代理
 * */

var net = require('net');
var index = 1;
var server = net.createServer(socket => {
    console.log('socket:%s', JSON.stringify(socket.address()))
    socket.index = index++;

    var proxy = new net.Socket();
    proxy.connect({host: '192.168.1.179', port: 3306}, () => {
        console.log('代理连接成功')
        proxy.on('error', err => console.log(err));
        proxy.on('data', data => socket.write(data));

        socket.on('error', err => console.log(err))
        socket.on('data', data => {
            console.log(socket.index + " 收到数据")
            proxy.write(data)
        });
    });


});
server.on('error', err => console.log(err));
server.listen({host: '0.0.0.0', port: 6666}, () => console.log('服务器启动成功'));
