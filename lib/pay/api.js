/**
 * Created by qianqing on 16/8/15.
 */
var _ = require('lodash');
var request = require('../common/weixin-request');
var util = require('../common/weixin-util');
var v = require('../validator/index');
var crypto = require('crypto');

var api = {
  /**
   * Handler for weixin server response
   *
   * @param app
   * @param merchant
   * @param json                    Validation for data received
   * @param resultValidator         Validation for data result
   * @param cb
   * @returns {*}
   */
  handle: function (app, merchant, json, resultValidator, cb) {
    var returnCode = json.return_code;
    var returnMsg = json.return_msg;
    var error = {};

    if (returnCode === 'SUCCESS') {
      var vError = api.validate(app, merchant, json);
      if (vError !== true) {
        cb(true, vError, json);
        return;
      }

      // 是否还要验证数据
      if (resultValidator === null) {
        cb(false, null, json);
        return;
      }
      var resultCode = json.result_code;
      if (resultCode === 'SUCCESS') {
        if (!v.validate(json, resultValidator, error)) {
          cb(true, error, json);
          return;
        }
        var result = v.json.extract(json, resultValidator);
        cb(false, result, json);
        return;
      }
    }
    cb(true, returnMsg, json);
  },

  /**
   * Basic http request wrapper for pay apis, which need to be encrypted and verified for their data format
   *
   * @param url                 Requesting url
   * @param data                Data to be sent
   * @param sendConfig          Sending data validation configuration
   * @param receiveConfig       Receiving data validation configuration
   * @param certificate         Certificate from Tencent Pay
   * @param cb                  Callback Function
   */
  request: function (config, url, data, sendConfig, receiveConfig, cb) {
    var error = {};

    // Validate Sending Data
    if (!v.validate(data, sendConfig, error)) {
      cb(true, error);
      return;
    }

    var params = _.clone(data);
    params = api.prepare(config.app, config.merchant, params);
    var sign = api.sign(config.merchant, params);

    params.sign = sign;
    var xml = util.toXml(params);
    request.xml(url, xml, function (error, json) {
      api.handle(config.app, config.merchant, json, receiveConfig, cb);
    });
  },

  /**
   * Prepare data with normal fields
   *
   * @param data
   * @param app
   * @param merchant
   * @param device
   * @returns {*}
   */
  prepare: function (app, merchant, data, device) {
    data.appid = app.id;
    /* eslint camelcase: [2, {properties: "never"}] */
    data.mch_id = merchant.id;
    if (device) {
      data.device_info = device.info;
    }
    data.nonce_str = util.getNonce();
    return data;
  },

  /**
   * Sign all data with merchant key
   *
   * @param merchant
   * @param params
   * @returns {string}
   */
  sign: function (merchant, params) {
    var temp = util.marshall(params);
    temp += '&key=' + String(merchant.key);
    temp = new Buffer(temp);
    temp = temp.toString('binary');
    var crypt = crypto.createHash('MD5');
    crypt.update(temp);
    return crypt.digest('hex').toUpperCase();
  },

  /**
   *  Validate header for data received
   *
   * @param data
   * @param app
   * @param merchant
   * @returns {*}
   */
  validate: function (app, merchant, data, error) {
    var config = require('./validation');
    var conf = config.auth.header;
    error = error || {};

    if (!v.validate(data, conf, error)) {
      return new Error('Validation Failed!');
    }
    if (String(data.appid) !== String(app.id)) {
      return new Error('AppId Invalid!');
    }
    if (String(data.mch_id) !== String(merchant.id)) {
      return new Error('Merchant Id Invalid!');
    }
    return true;
  }
};

module.exports = api;
