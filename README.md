# node-weixin-pay [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> 基于redis的微信api

## 集成的模块有：

  1. auth 用于与微信服务器握手检验
  2. oauth 微信OAuth相关的操作
  3. pay 微信支付的服务器接口
  4. media 微信多媒体相关的操作
  

## Install

```sh
$ npm install --save node-myun-weixin
```


## Usage


> 通用功能

1、初始化对象

```js
var nodeWeixin = require('node-myun-weixin');
var redis_config = {
  host: '127.0.0.1',
  port: 6379,
  db: 0,
  password: ''
};

var wx = nodeWeixin(redis_config);
//如果redis没有密码, 请不要传入password字段
```

2、基本数据
```
所有接口第一个参数必须是微信配置数据项, 具体格式如下:
var merchant = {
  id: 商户号,
  key: 商户秘钥
};

var app = {
  id: 微信公众号app id,
  secret: 微信公众号app secret
};

var certificate = {
  pkcs12: path.resolve(certPKCS12File),             //商户加密文件
  key: String(certKey)
};

//对于大部分的支付接口来说是需要config的
var config = {
  app: app,
  merchant: merchant,
  certificate: certificate
};
```

> 具体的API请求部分

### auth 用于与微信服务器握手检验

1、获取 Access Token

```js
var auth = wx.auth;
auth.getAccessToken(config, function (err, accessToken) {

});
```

2、获取 Js Api Ticket

```js
var auth = wx.auth;
auth.getJsApiTicket(config, function (err, ticket) {

});
```

2、获取 get Js Sdk Config

```js
var auth = wx.auth;
auth.getJssdkConfig(config, url, function (err, result) {

});
```

### oauth 微信OAuth相关的操作

1、获取 oauth 请求地址

```js
var oauth = wx.oauth;
var url = oauth.createURL(config, redirectUri, state, scope);
//scope: 0 snsapi_base  1 snsapi_userinfo
```

2、解析 oauth 返回的数据

```js
var oauth = wx.oauth;
oauth.success(config, req.query.code, function (error, body) {
  console.log(body.openid);
  console.log(body.access_token);
  res.redirect(req.query.state);
});
```

3、解析用户信息

```js
var oauth = wx.oauth;
oauth.success(config, req.query.code, function (error, body) {
  oauth.profile(body.openid, body.access_token, function (error, body) {
    console.log(body.nickname);
    console.log(body.sex);
    console.log(body.headimgurl);
  });
});
```

### pay 微信支付相关的操作
```js
var params = { openid: process.env.OPENID,
  spbill_create_ip: '1.202.241.25',
  notify_url: 'http://wx.domain.com/weixin/pay/main',
  body: '测试支付',
  out_trade_no: '111',
  total_fee: '1',
  trade_type: 'JSAPI',
};
```

1、发送统一支付请求

```js
var pay = wx.pay;
pay.order.unified(config, params, function(error, data) {
});
```

2、发送订单查询请求

```js
var pay = wx.pay;
pay.order.query(config, params, function(error, data) {
});
```

3、发送订单关闭请求

```js
var pay = wx.pay;
pay.order.close(config, params, function(error, data) {
});
```

4、发送创建退款请求

```js
var pay = wx.pay;
pay.refund.create(config, params, function(error, data) {
});
```

5、发送退款查询请求

```js
var pay = wx.pay;
pay.refund.query(config, params, function(error, data) {
});
```

6、发送下载对账单请求

```js
var pay = wx.pay;
pay.statements(config, params, function(error, data) {
});
```

7、发送测速报告请求

```js
var pay = wx.pay;
pay.report(config, params, function(error, data) {
});
```

8、签名一个请求

```js
var pay = wx.pay;
var sign = pay.sign(config, params);
```


9、准备一个支付配置

```js
var id = 'id';
var pay = wx.pay;
pay.prepay(config, id);
```

10、外理回调数据

```js
//req.rawBody should be enabled
var req = {rawBody: xml};
var res = {
  json: function() {

  }
};
var pay = wx.pay;
pay.notify(app, merchant, req, res, function(error, data) {
});
```

## License

MIT © [joneqian](https://github.com/joneqian)


[npm-image]: https://badge.fury.io/js/node-weixin-pay.svg
[npm-url]: https://npmjs.org/package/node-weixin-pay
[travis-image]: https://travis-ci.org/node-weixin/node-weixin-pay.svg?branch=master
[travis-url]: https://travis-ci.org/node-weixin/node-weixin-pay
[daviddm-image]: https://david-dm.org/node-weixin/node-weixin-pay.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/node-weixin/node-weixin-pay
[coveralls-image]: https://coveralls.io/repos/node-weixin/node-weixin-pay/badge.svg
[coveralls-url]: https://coveralls.io/r/node-weixin/node-weixin-pay
