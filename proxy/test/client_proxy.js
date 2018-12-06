var net = require('net');

var eventSocket = new net.Socket();
var id;
eventSocket.connect({host: '127.0.0.1', port: 8888}, () => {

    console.log('connect server success.')

    eventSocket.on('response', data => {
        //本次会话的id
        id = data.id;
        if (data.command == 'start_proxy') {
            console.log('收到连接外网命令，准备主动连接:%s', JSON.stringify(data));
            connectIntSocket(data);
        } else {
            console.log('无效的命令');
            console.log(data)
        }
    });

    eventSocket.on('data', data => {
        eventSocket.emit('response', JSON.parse(data.toString()));
    });
    eventSocket.on("error", err => console.log(err));
});

/**
 * 连接内网的socket
 * @param data
 */
function connectIntSocket(data) {
    //获取端口号进行连接

    //外网服务器
    var server = new net.Socket();

    //内网服务器
    var proxy = new net.Socket();

    //先连接内网服务器，成功后连接外网
    // var proxy_host = '192.168.1.180';
    // var proxy_port = 27017;

    // var proxy_host = '192.168.1.114';
    // var proxy_port = 3389;

    var proxy_host = '192.168.1.179';
    var proxy_port = 22;

    //创建内网连接
    proxy.connect({host: proxy_host, port: proxy_port}, () => {

        //连接成功后连接内网端口
        server.connect({host: '127.0.0.1', port: data.intPort}, () => {

            //连接成功后发送一条连接成功的通知
            server.write(JSON.stringify({outId: data.outId}));

            //交换通道
            proxy.pipe(server);
            server.pipe(proxy);

        });
    });
    proxy.on('end',()=>{
        console.log('释放代理服务器');
        proxy.end();
    })
    proxy.on('error', err => console.log("代理服务器报错",err));

}