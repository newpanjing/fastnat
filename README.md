# FAST NAT 全协议内网穿透
`FAST NAT是基于WeNAT的扩展版，支持HTTP、TCP、UDP、WebSocket等协议。`
## QQ群：524948153

# TCP协议和流程 
## 流程图
![](https://raw.githubusercontent.com/newpanjing/fastnat/master/doc/images/%E6%B5%81%E7%A8%8B%E5%9B%BE.jpg)

## 应用场景
+ 本地发布网站
+ 远程桌面
+ SSH 本地服务器
+ 访问本地mysql
+ 访问本地redis
+ 访问本地mongodb

## 内外网代理流程
+ 内网和外网建立协议通道，用于主动连接通知
+ 外网客户端连接服务器，并且分配一个id，保存起来
+ 通知内网客户端，并且告诉id，由内网主动发起连接
+ 内网连接代理目标
+ 内网连接服务器，并且传入id，和外网进行绑定
+ 映射内外网的socket

## 断线和报错处理
+ 任何一方报错，终端所有端口监听以及所有的连接
+ 由客户端再次发起连接请求，并且分配一个随机端口或者继续使用上次的外网端口


## TCP接口
+ ### 协议类型
    协议为JSON字符串

+ ### 安全性
    在第一次连接服务器的时候，需要带上用户的token，服务器进行校验合法后开放2个端口提供给后续使用。
    在后续的流程中，不做任何校验。虽然有安全风险，但是常见的TCP应用：Mysql、Mongodb、Redis等，都有用户机制可以保护。

+ ### 和通信服务器连接
    + 基本信息响应
    
        >直接连接通信服务器端口8888，不用发送任何数据，成功后响应如下数据
        
        | 字段   |      类型      |  说明 |
        |----------|:-------------:|:------|
        | id |  string(8) | 本次会话的id |
        | outId |  string(8) | 外网socket 会话id |
        | intPort |    int(5)   |   内网连接的端口,5位数的端口，30000-65535 |
        | outPort | int(5) |    外网连接的端口 |
        | command | string | 操作命令 |
    
        + 举个栗子🌰
        ```javascript
         {
           id: 'CucfFpk7',
           intPort: 61289,
           outPort: 59918,
           command: 'start_proxy',
           outId: 'GpNYO5KW' 
         }
        ```
    + 主动连接服务器
    
        >收到基本信息响应后，拿到内网的端口建立一个TCP连接，并且带上outId，
        第一个数据包为协议包，后续的数据就是正常的转发
        
        | 字段   |      类型      |  说明 |
        |----------|:-------------:|:------|
        | outId |  string(8) | 外网socket 会话id |
        
         + 举个栗子🌰
        ```javascript
         {
           outId: 'GpNYO5KW' 
         }
        ```
