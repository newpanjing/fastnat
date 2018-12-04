var http_request = require('../utils/http_request');
var async = require('async');
var net = require('net');

/**
 * 向服务器注册
 * @param params
 */
function register(params) {

    //http请求，让服务器开放内外网的临时端口
    async.waterfall([
        function (callback) {
            http_request.post('http://localhost:3000/register', {protocol: "TCP"}, callback);
        },
        function (data, callback) {

            //连接
            console.log("数据", data)
            connect(data, params);

            callback(null, data)
        }
    ], function (err, rs) {
        if (err) {
            console.log("错误", err);
        }
        if (rs) {
            console.log("返回结果", rs);
        }
    });

}

/**
 * 连接外网服务器和内网服务器
 * @param data
 * @param params
 */
function connect(data, params) {

    //连接服务器
    var outSocket = net.Socket();
    outSocket.connect(data.intPort, '127.0.0.1', () => {
        console.log(`连接外网服务器成功:${JSON.stringify(outSocket.address())}`)
    });

    //禁用粘包
    outSocket.setNoDelay(true);

    outSocket.on('data', data => {
        console.log(`收到外网数据包，长度:${data.length}`);
        //准备发到内网
        if (!outSocket.proxy) {
            var proxy = new net.Socket();

            //禁用粘包
            proxy.setNoDelay(true);
            proxy.connect(params.proxy.port, params.proxy.host, () => {
                console.log(`连接内网目标成功：${JSON.stringify(params.proxy)}`)
                console.log(`转发数据包给目标，长度:${data.length}`)
                //转发数据包
                proxy.write(data);
                console.log(`代理请求：${data.join(",")}`)
            });
            proxy.on('data', data1 => {
                console.log(`收到代理目标响应并转发给外网socket，长度：${data1.length}`)
                outSocket.write(data1)
            });
            proxy.on('error', err => console.error('内网代理socket出错', err));
            proxy.on('end', () => proxy.end());
            outSocket.proxy = proxy;
        } else {
            outSocket.proxy.write(data);
        }
    });
    outSocket.on('end', () => outSocket.end());
    outSocket.on('error', err => console.error("外网socket报错：", err))

}

register({
    protocol: "TCP",
    proxy: {
        // port: 3389,
        // host: '192.168.1.114'
        // port: 22,
        // host: '192.168.1.179'
        port: 6379,
        host: '192.168.1.179'
        // port: 27017,
        // host: '192.168.1.180'
    }
});