const dgram = require('dgram');
var client = dgram.createSocket('udp4');
client.on('close', () => {
    console.log('socket已关闭');
});
client.on('listening', () => {
    console.log('监听中')
});
client.on('error', (err) => {
    console.log(err);
});
client.on('message', function (msg, info) {
    console.log(`from:${info.port} ${info.address} msg:${msg}`)
});
client.bind(8889);

client.send('你好，我是客户端1', 19225, '116.7.99.29')
// client.send('你好，我是客户端1', 9999, 'www.88cto.com')