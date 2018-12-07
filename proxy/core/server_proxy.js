/**
 *
 * 监听3个端口
 * 外网链接端口、内网协议通信端口、内网代理端口
 *
 */

var net = require('net');
var utils = require('./utils');

//通信socket 格式 id=socket
var eventSockets = {};

//外网socket 格式 id=socket
var outSockets = {};

//内网socket 格式 id=socket，id和外网的id一致
var intSockets = {};

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
        console.log('释放通信socket id:%s', socket.id);
        //断开连接
        socket.end();
        socket.destroy();

        //从集合中删除
        delete eventSockets[socket.id];
    }
    socket.on('error', handler);
    // socket.on('end', handler);
    socket.on('close', handler);

});
eventServer.on('error', err => console.log('服务器出错：', err));
eventServer.listen(port, () => console.log('listen %s', port));


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

                //加入集合中
                intSockets[proxy.id] = proxy;

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

        //内网断开释放外网的socket
        release(proxy, () => {
            if (proxy.id) {

                var id = proxy.id;

                //释放内网socket内存
                delete intSockets[id];

                //释放外网socket
                var out = outSockets[id];
                if (out) {
                    console.log('内网断开 释放外网socket id:%s', id);
                    out.destroy();
                }

            }
        });

    });
    proxyServer.on('error', err => console.log('内网监听出错：', err))
    proxyServer.listen(intPort, () => console.log('会话id：%s 内网监听端口：%s', socket.id, intPort));


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

        release(out, () => {

            var id = out.id;

            console.log('外网释放socket id：%s', id);

            //从集合中删除
            delete outSockets[id];

            //内网的socket也需要释放
            var int = intSockets[id];
            if (int) {
                console.log('外网断开释放内网 socket id:%s', id);
                int.destroy();
                delete intSockets[id];
            }

            //TODO  server 一定时间内没有新连接或者有效连接，就进行释放

        });

    });
    outServer.on('eror', error => console.log(error));
    outServer.listen(outPort, () => console.log('会话id：%s 外网端口开始监听 %s', socket.id, outPort));

}

/**
 * 释放socket
 * @param socket
 */
function release(socket, callback) {

    //socket断开的事件 为error和close，end事件不做处理
    var handler = (err) => {
        if (err) {
            console.error('socket id=%s  报错:', socket.id, err);
        }

        callback(socket);

        //半关闭 socket。例如发送一个 FIN 包。服务端仍可以发送数据。
        socket.end();
        //确保在该 socket 上不再有 I/O 活动。仅在出现错误的时候才需要（如解析错误等）。
        socket.destroy();
    };
    socket.on('close', handler);
    socket.on('error', handler);

}