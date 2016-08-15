/**
 * Created by qianqing on 16/8/15.
 */
'use strict';

var validation = require('./validation');
var request = require('./api').request;
var sign = require('./api').sign;
var handle = require('./api').handle;
var crypto = require('crypto');
var xml2js = require('xml2js');

function onRes(res, error, cb) {
  cb();
  res.set('Content-Type', 'text/xml');
  var xml = '';
  if (error) {
    xml = '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[' + error + ']]></return_msg></xml>';
  } else {
    xml = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
  }
  res.send(xml);
}

module.exports = {
  order: {
    unified: function (wx_config, data, cb) {
      var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
      request(wx_config, url, data,
        validation.unified.sending,
        validation.unified.receiving,
        cb);
    },
    query: function (wx_config, data, cb) {
      var url = 'https://api.mch.weixin.qq.com/pay/orderquery';
      request(wx_config, url, data,
        validation.order.query,
        validation.order.trade,
        cb);
    },
    close: function (wx_config, data, cb) {
      var url = 'https://api.mch.weixin.qq.com/pay/closeorder';
      request(wx_config, url, data,
        validation.order.query,
        validation.order.trade,
        cb);
    }
  },
  refund: {
    create: function (wx_config, data, cb) {
      var url = 'https://api.mch.weixin.qq.com/secapi/pay/refund';
      request(wx_config, url, data,
        validation.refund.create.sending,
        validation.refund.create.receiving,
        cb);
    },
    query: function (wx_config, data, cb) {
      var url = 'https://api.mch.weixin.qq.com/pay/refundquery';
      request(wx_config, url, data,
        validation.refund.query.sending,
        validation.refund.query.receiving,
        cb);
    }
  },
  statements: function (wx_config, data, cb) {
    var url = 'https://api.mch.weixin.qq.com/pay/downloadbill';
    request(wx_config, url, data,
      validation.statements.sending,
      null,
      cb);
  },
  report: function (wx_config, data, cb) {
    var url = 'https://api.mch.weixin.qq.com/payitil/report';
    request(wx_config, url, data,
      validation.report.sending,
      null,
      cb);
  },
  sign: function (wx_config, params) {
    return sign(wx_config.merchant, params);
  },
  prepay: function (wx_config, prepayId) {
    var md5 = crypto.createHash('md5');
    var timeStamp = String(new Date().getTime());

    md5.update(timeStamp);
    timeStamp = Math.floor(timeStamp / 1000);

    var nonceStr = md5.digest('hex');
    var data = {
      appId: wx_config.app.id,
      timeStamp: String(timeStamp),
      nonceStr: nonceStr,
      package: 'prepay_id=' + prepayId,
      signType: 'MD5'
    };
    data.paySign = sign(wx_config.merchant, data);
    return data;
  },
  notify: function (wx_config, req, res, cb) {
    var xmlIn = req.body || req.rawBody;

    xml2js.parseString(xmlIn, {
      explicitArray: false,
      ignoreAttrs: true
    }, function (error, json) {
      if (error) {
        return cb(true, new Error(xmlIn));
      }

      handle(wx_config.app, wx_config.merchant, json.xml, validation.notify, function (error, result) {
        onRes(res, error, function () {
          if (cb) {
            cb(error, result, json);
          }
        });
      });
    });
  }
};

