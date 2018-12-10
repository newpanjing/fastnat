module.exports = {
    entry: __dirname + "/public/app.js",//已多次提及的唯一入口文件
    output: {
        path: __dirname + "/public",//打包后的文件存放的地方
        filename: "dist/bundle.js"//打包后输出文件的文件名
    }
}
