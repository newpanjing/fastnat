var net = require('net');

var server = net.createServer(socket => {

    socket.on('data', data => {
        console.log(`代理请求，长度：${data.length}`)
        if (!socket.proxy) {
            var proxy = new net.Socket();
            socket.proxy = proxy;
            // proxy.connect(3389, '192.168.1.114', () => proxy.write(data));
            // proxy.connect(3306, '192.168.1.179', () => proxy.write(data));
            proxy.connect(27017, '192.168.1.180', () => proxy.write(data));
            proxy.on('data', d => {

                console.log(`代理响应，长度：${d.length}}`)
                socket.write(d);
                //jieshu
                // proxy.end()
            });
            proxy.on('end', () => proxy.end());
            proxy.on('error', err => console.error(err))
        } else {
            socket.proxy.write(data);
        }
    });

    socket.on('end', () => socket.end());
    socket.on('error', err => console.error(err))


});
server.on('error', err => console.error(err));
var port = 3389;
server.listen(port);
console.log(`listen ${port}`)