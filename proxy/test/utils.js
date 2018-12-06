var uuid = require('uuid');

var shortArray = ["a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
    "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I",
    "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
    "W", "X", "Y", "Z"]

/**
 * 获取一个短id
 * @returns {string}
 */
exports.getShortId = () => {

    var uid = uuid.v4();
    uid = uid.replace(/-/g, "");
    var buffer = [];

    for (var i = 0; i < 8; i++) {
        let start = i * 4
        let end = i * 4 + 4
        var str = uid.substring(start, end);
        buffer.push(shortArray[parseInt(str, 16) % 62])
    }
    return buffer.join("");
}

/**
 * 获取随机端口
 * 范围 30000-65536
 */
exports.getRandomPort = () => {
    var min = 30000;
    var max = 65535;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 把对象转为json
 * @param obj
 */
exports.getJSONString = obj => {
    if (typeof (obj) == "string") {
        return obj;
    }

    return JSON.stringify(obj);
}