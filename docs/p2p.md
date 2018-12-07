# P2P 穿透
第一版采用服务器中转穿透，后续考虑扩展为P2P穿透，本文档用于存档

## P2P 服务端
```javascript
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('close',()=>{
    console.log('socket已关闭');
});

server.on('error',(err)=>{
    console.log(err);
});

server.on('listening',()=>{
    console.log('socket正在监听中...');
});

server.on('message',(msg,rinfo)=>{
    console.log(`receive message from ${rinfo.address}:${rinfo.port}`);
    server.send('exit',rinfo.port,rinfo.address)
});

server.bind('8060');
```

## P2P 客户端1
```javascript
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
```

## P2P 客户端2
```javascript
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
client.bind(8888);

client.send('你好，我是客户端2', 18912, '116.7.99.29')
```