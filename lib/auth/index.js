/**
 * Created by qianqing on 16/8/13.
 */
'use strict';
/* eslint camelcase: [2, {properties: "never"}] */
var crypto = require('crypto');
var request = require('request');
var util = require('../common/weixin-util');

var weixinUrls = {
  tokenBaseUrl: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential',
  ticketBaseUrl: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
  permanentUrl: 'https://api.weixin.qq.com/cgi-bin/material/',
  temporaryUrl: 'https://api.weixin.qq.com/cgi-bin/media/'
};


module.exports = function (redis_client) {
  return {
    ACCESS_TOKEN_EXP: 7200 * 1000,
    TIME_GAP: 500,
    REDIS_CLIENT: redis_client,
    getAccessToken: function (wx_config, callback) {
      var self = this;
      self.REDIS_CLIENT.get(wx_config.app.id + '_access_token', function (err, access_token) {
        if (err) {
          return callback(err, null);
        }

        var now = new Date();
        access_token = JSON.parse(access_token);
        if (access_token && access_token.tokenExpireTime && access_token.accessToken && now.getTime() / 1000 < access_token.tokenExpireTime) {
          return callback(null, access_token.accessToken);
        }

        var url = weixinUrls.tokenBaseUrl + '&appid=' + wx_config.app.id + '&secret=' + wx_config.app.secret;

        request.get(url, function (error, response, body) {

          if (error) {
            return callback(error, null);
          }
          var data = JSON.parse(body);
          var token = {};
          token.accessToken = data['access_token'];
          var d = new Date();
          token.tokenExpireTime = d.getTime() / 1000 + data['expires_in'] - 30;

          self.REDIS_CLIENT.set(wx_config.app.id + '_access_token', JSON.stringify(token), function (err, auth) {
            if (err) {
              return callback(err, null);
            }

            callback(null, token.accessToken);
          });
        });
      })
    },
    getJsApiTicket: function (wx_config, callback) {
      var self = this;
      self.REDIS_CLIENT.get(wx_config.app.id + '_ticket', function (err, ticket) {
        if (err) {
          return callback(err, null);
        }

        var now = new Date();
        ticket = JSON.parse(ticket);
        if (ticket && ticket.ticketExpireTime && ticket.jsApiTicket && now.getTime() / 1000 < ticket.ticketExpireTime) {
          return callback(null, ticket.jsApiTicket);
        }

        self.getAccessToken(function (err, accessToken) {
          if (err) {
            return callback(err, null);
          }

          var url = weixinUrls.ticketBaseUrl + '?access_token=' + accessToken + '&type=jsapi';
          request.get(url, function (error, response, body) {
            if (error) {
              return callback(error, null);
            }

            var data = JSON.parse(body);
            var ticket_obj = {};
            ticket_obj.jsApiTicket = data['ticket'];
            var d = new Date();
            ticket_obj.ticketExpireTime = d.getTime() / 1000 + data['expires_in'] - 30;

            self.REDIS_CLIENT.set(wx_config.app.id + '_ticket', JSON.stringify(ticket_obj), function (err, auth) {
              if (err) {
                return callback(err, null);
              }

              callback(null, ticket_obj.jsApiTicket);
            });
          });
        });
      });
    },
    getJssdkConfig: function (wx_config, url, callback) {
      var self = this;
      self.getJsApiTicket(wx_config, function (err, ticket) {
        if (err) {
          return callback(err);
        }
        var result = self.createSha1Sign(ticket, url);
        result.appId = wx_config.app.id;
        callback(null, result);
      });
    },
    createSha1Sign: function (jsApiTicket, url) {
      var self = this;
      var data = {
        jsapi_ticket: jsApiTicket,
        nonceStr: self.createNonceStr(),
        timestamp: self.createTimestamp(),
        url: url
      };
      var str = self.raw(data);
      var sha1 = crypto.createHash('sha1');
      sha1.update(str);
      data.signature = sha1.digest('hex');
      delete data.jsapi_ticket;
      delete data.url;
      return data;
    },
    createNonceStr: function () {
      return Math.random().toString(36).substr(2, 15);
    },
    createTimestamp: function () {
      return parseInt(new Date().getTime() / 1000);
    },
    raw: function (args) {
      var keys = Object.keys(args),
        newArgs = [],
        result;

      keys = keys.sort();
      keys.forEach(function (key) {
        newArgs.push([key.toLowerCase(), args[key]].join('='));
      });
      result = newArgs.join('&');
      return result;
    }
  }
};
