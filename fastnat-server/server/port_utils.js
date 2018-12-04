/**
 * 获取指定范围的端口
 * @param min 30000
 * @param max 65535
 * @returns {number}
 */
exports.getRandomPort = function () {
    var min = 30000;
    var max = 65535;
    return Math.floor(Math.random() * (max - min + 1) + min);
}