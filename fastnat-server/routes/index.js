var express = require('express');
var router = express.Router();
var TCPPorxyServer = require('../server/TCPProxyServer').TCPPorxyServer;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/**
 * 客户端向服务端注册，申请开放一个临时端口，分为外网端口和内网端口
 */
router.post('/register', function (req, res, next) {
    var body = req.body;
    var protocol = body.protocol;
    if ("TCP" == protocol) {
        var tcp = new TCPPorxyServer();
        tcp.listen();

        res.json({
            intPort: tcp.getIntPort(),
            outPort: tcp.getOutPort()
        });

    } else {
        res.end({msg: '协议类型不支持'})
    }


});

module.exports = router;
