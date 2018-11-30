const dgram = require('dgram');

function UPD(ip, port) {

    this.bind = function (callback) {
        var client = dgram.createSocket('udp4');
        client.on('close', () => {
            console.log('socket已关闭');
        });

        client.on('error', (err) => {
            console.log(err);
        });
        client.on('message', callback);

        return {
            send: function (msg) {
                client.send(msg, port, ip);
            }
        }
    }


}


exports.UDP = UPD