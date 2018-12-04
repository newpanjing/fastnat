/**
 * tcp反向代理
 * net模块官方文档 https://nodejs.org/api/net.html
 * Created by zhuangjiesen on 2017/12/7.
 */

console.log('script starting...')
var net = require('net');
//反向代理服务监听
var LOCAL_PORT  = 1024;
//反向代理远程服务器
var REMOTE_PORT = 3389;
//反向代理地址
var REMOTE_HOST = "192.168.1.114";

function targetServer(){
    this.host;
    this.port;
}


var targetServerList = [];
var targetServer = new targetServer();
targetServer.port = REMOTE_PORT;
targetServer.host = REMOTE_HOST;
targetServerList.push(targetServer);
function getServer(){
    return targetServerList[0];
}


var invokeTime = 0;
var tcpProxyServer = net.createServer(function (clientSocket) {
    clientSocket.on('data', function (msg) {
        console.log('  ** START **');
        console.log('<< From client to proxy ' );
        // console.log('<< From client to proxy ' , msg.toString());
        //连接复用
        var serviceSocket = null;
        if ((serviceSocket = clientSocket.serviceSocket)) {
            // console.log('<<  proxy has created ....', msg.toString());
            serviceSocket.write(msg);
        } else {
            var serviceSocket = new net.Socket();
            clientSocket.serviceSocket = serviceSocket;
            serviceSocket.connect(parseInt(getServer().port), getServer().host, function () {
                // console.log('>> From proxy to remote', msg.toString());
                serviceSocket.write(msg);
            });
            serviceSocket.on("data", function (data) {
                // console.log('<< From remote to proxy', data.toString());
                clientSocket.write(data);
                console.log('invokeTime : ' , invokeTime ++ )
            });
            serviceSocket.on('end', function() {
                console.log(' == serviceSocket disconnected from server');
            });
            //服务端连接出问题，断开客户端
            serviceSocket.on('error', function(err) {
                console.error(' == serviceSocket has error ' , err);
                clientSocket.end();
            });
        }
    });
    clientSocket.on('end', function() {
        console.log('== clientSocket disconnected from server');
    });
    clientSocket.on('error', function(err) {
        console.error('== clientSocket has error : ' , err);
    });
});



tcpProxyServer.on('error', function(error) {
    console.error('== tcpProxyServer has error : ' , error);
});

//创建反向代理服务
tcpProxyServer.listen(LOCAL_PORT);
console.log(" TCP server accepting connection on port: " + LOCAL_PORT);
console.log(" TCP proxy has started successfully! ");

/*
* 300 毫秒检测连接
* */
var periodServerTest = setInterval(function(){
} , 300) ;
