/**
 *
 * 监听3个端口
 * 外网链接端口、内网协议通信端口、内网代理端口
 *
 */

var net = require('net');
var utils = require('./utils');

//格式 id:socket
var eventSockets = {};
var port = 8888;
/**
 * 创建通信server
 * 理论上 通信socket只允许一个
 * @type {Server}
 */
var eventServer = net.createServer(socket => {

    //分配一个会话id
    var id = utils.getShortId();
    socket.id = id;


    eventSockets[id] = socket;
    eventHandler(socket);
    //如果断开，从集合中移除
    var handler = (err) => {
        if (err) {
            console.log('%s socket 报错：', id);
        }

        //断开连接
        socket.end();
    }
    socket.on('error', handler);
    socket.on('end', handler);
    socket.on('close', handler);

});
eventServer.on('error', err => console.log('服务器出错：', err));
eventServer.listen(port, () => console.log('listen %s', port));


var outSockets = {};

/**
 * 通信协议socket处理
 * @param socket
 */
function eventHandler(socket) {

    //当内网连接后，分配一个专属的随机端口

    //内网随机端口
    var intPort = utils.getRandomPort();

    //外网随机端口
    var outPort = utils.getRandomPort();

    //返回结果
    var result = {
        id: socket.id,
        intPort: intPort,
        outPort: outPort,
        command: 'start_proxy'//启动代理
    }

    //创建内网server，等待内网连接，然后恢复外网socket数据收发
    var proxyServer = net.createServer(proxy => {
        console.log('内网发起了主动连接：%s', JSON.stringify(proxy.address()));
        //读取第一条信息，包含id信息
        proxy.on('data', data => {
            //解析，如果proxy的id为空，第一条数据就默认为协议头
            if (!proxy.id) {

                //解析协议头
                var json = data.toString();
                var obj = JSON.parse(json);
                proxy.id = obj.outId;

                console.log('内网主动连接，id=%s', proxy.id);

                //只注册一次
                var outSocket = outSockets[proxy.id];
                outSocket.pipe(proxy);
            } else {

                //通过id 找到外网socket 并且恢复数据的接收
                var outSocket = outSockets[proxy.id];
                if (outSocket) {
                    //第二次开始的数据包直接转发
                    outSocket.write(data);
                }



            }

        });

    });
    proxyServer.on('error', err => console.log('内网监听出错：', err))
    proxyServer.listen(intPort, () => console.log('内网监听端口：%s', intPort));


    //端口创建好了之后告诉内网
    //创建外网

    var outServer = net.createServer(out => {

        var outId = utils.getShortId();
        out.id = outId;
        //1.外网收到socket的时候告诉通信服务器
        //2.通信服务器告诉内网socket
        //3.内网socket带着id来连接
        //4.内外网交换数据
        result.outId = outId;

        socket.write(utils.getJSONString(result));
        console.log('通知内网连接 外网：%s', JSON.stringify(result));
        //暂停数据的接收
        // out.pause();
        //把socket加入集合
        outSockets[outId] = out;

    });
    outServer.on('eror', error => console.log(error));
    outServer.listen(outPort, () => console.log('外网端口开始监听 %s', outPort));

}