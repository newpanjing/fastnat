const net = require('net');

//不区分内网和外网的客户端

let server = net.createServer((socket) => {

    if (!this.socket1) {
        this.socket1 = socket;

        console.log('socket1建立连接')
        this.socket1.on('error', err => {
            console.log("socket1报错", err)
            this.socket1.end();
            this.socket1 = null;
        });
    } else {
        this.socket2 = socket;
        console.log('socket2建立连接')
        this.socket1.pipe(this.socket2);
        this.socket2.pipe(this.socket1);

        this.socket2.on('error', err => {
            this.socket2.end();
            this.socket2 = null;
            console.log('socket2报错', err)
        });
    }
});
server.on("error", err => console.log('server出错', err));
server.listen({port: 8888}, () => console.log(" opened server on address %j ", server.address()))