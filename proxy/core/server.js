var net = require('net');

var socket1, scoket2;
var server1 = net.createServer(s1 => {
    s1.setEncoding('binary');
    socket1 = s1;
    var call = (err) => {
        console.log('释放s1的socket和server', err || "");

        s1.end();
        server1.close();

        scoket2.end();
        server2.close();
    };

    s1.on('data', data => {
        if (scoket2) {
            scoket2.write(data);
        }
    })
    s1.on('end', call);
    s1.on('error', call);


});
server1.listen(8001);
console.log('启动s1 端口8001');

var server2 = net.createServer(s2 => {
    s2.setEncoding('binary');
    scoket2 = s2;
    var call = (err) => {
        console.log('释放s2的socket和server', err || "");
        s2.end();
        server2.close();

        socket1.end();
        server1.close();
    };
    s2.on('data', data => {
        if (socket1) {
            socket1.write(data)
        }
    });
    s2.on('end', call);
    s2.on('error', call);

});
server2.listen(8002)
console.log('启动s2 端口8002');
