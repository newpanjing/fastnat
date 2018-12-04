/**
 TCP协议代理服务器，开放2个随机端口，一个给外网，一个给内网

 待优化项，超时未用，自动关闭，节约端口资源
 */
var port_utils = require('./port_utils');
var net = require('net');

class TCPProxyServer {

    constructor() {

        //产生2个随机的端口，如果出现重复+1
        this.intPort = port_utils.getRandomPort();
        // this.outPort = port_utils.getRandomPort();
        this.outPort = 8888;//临时固定测试

        //创建2个tcp监听，数据包互相交换
        //外网->内网
        //内网->外网

    }

    /**
     * 监听
     */
    listen() {

        //内网
        var intSocket, outSocket;
        var intPort = this.getIntPort();
        var outPort = this.getOutPort();


        var intServer = net.createServer(function (int) {

            //禁用Nagle算法
            int.setNoDelay(true);
            console.log(`内网端口建立连接：${JSON.stringify(int.address())}`)

            intSocket = int;
            //data、end
            int.on("data", (data) => {
                if (outSocket) {
                    console.log(`收到内网客户端响应:${data.length}`)
                    outSocket.write(data);
                }
            });

            int.on("end", () => {
                try {
                    console.log('断开内网连接');
                    intServer.close();
                    outServer.close();
                } catch (e) {
                    console.error("有一方掉线，断开连接。")
                }
            });

            int.on('error', err => {
                console.log('内网连接错误，准备断开连接' + err);
                int.end();
                intServer.close();
            });

        });
        intServer.on('error', error => {
            console.log(`内网server监听出错，关闭端口监听${intPort}`)
        })
        intServer.listen(this.getIntPort());

        var outServer = net.createServer(function (out) {
            //禁用Nagle算法
            out.setNoDelay(true);

            outSocket = out;
            console.log(`外网端口建立连接：${JSON.stringify(out.address())}`)
            //data、end
            out.on("data", (data) => {
                console.log(`收到外网端口数据包长度：${data.length}`)
                if (intSocket) {
                    console.log(`转发数据到内网，长度:${data.length}`)
                    intSocket.write(data);
                }
            });

            out.on('end', () => {
                try {
                    intServer.close();
                    outServer.close();
                    console.log('断开外网连接');
                } catch (e) {
                    console.error("有一方掉线，断开连接。")
                }
            });

            out.on('error', error => {
                console.error("外网socket错误，准备关闭所有连接：" + error)
                out.end();
                outServer.close();
            });

        });
        outServer.on('error', error => {
            console.log(`外网server监听出错，关闭端口监听${outPort}`)
        })
        outServer.listen(this.getOutPort());

        console.log(`创建随机端口，内网：${intPort}\t外网：${outPort}`)
    }

    /**
     * 获取内网端口
     */
    getIntPort() {
        return this.intPort;
    }

    /**
     * 获取外网端口
     */
    getOutPort() {
        return this.outPort;
    }

}

exports.TCPPorxyServer = TCPProxyServer;