

//【注意，当服务端代码写得有问题的时候，会出现明明尝试上传新代码，但是单步调试的时候发现后台代码并没有变化，还是旧版本的情况。(恢复再上传也一样】
var express = require('express');
var fs = require('fs');
var multiparty = require('multiparty');
// 腾讯云的文件存储SDK
var CosSdk = require('cos-nodejs-sdk-v5');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var mysql = require('../util').mysql;
var config = require('../config');

var request = require('request');
var crypto = require('crypto');
var moment = require('moment');
var sessionTable = 'session';

// 获取腾讯云配置
// serverHost, tunnelServerUrl, tunnelSignatureKey, qcloudAppId, qcloudSecretId, qcloudSecretKey, wxMessageToken
//var qcloudConfig = JSON.parse(fs.readFileSync('/data/release/sdk.config.json', 'utf8'));
var userTable = 'user';

// 文件存储sdk初始化
var cos = new CosSdk({
    AppId: '1256714442',
    SecretId: 'AKIDzpT0NYDO7e4JMIvzZwwFRXUFoBMRiVAs',
    SecretKey: 'jIk29NdpEbszvfDal7MapsqdEdpsmsR0'
});

////////////////////////////////////////////////【生成skey】
function sha1(message) {
    return crypto.createHash('sha1').update(message, 'utf8').digest('hex');
}

router.get('/', function (req, res, next) {

    var code = req.query.code;
    var curTime = moment().format('YYYY-MM-DD HH:mm:ss');

    request.get({
        uri: 'https://api.weixin.qq.com/sns/jscode2session',
        json: true,
        qs: {
            grant_type: 'authorization_code',
            appid: config.appid,
            secret: config.secret,
            js_code: code
        }
    }, function (err, response, data) {
        if (response.statusCode === 200) {
            var sessionKey = data.session_key;
            var openId = data.openid;
            var skey = sha1(sessionKey);
            var sessionData = {
                skey: skey,
                create_time: curTime,
                last_login_time: curTime,
                session_key: sessionKey
            };

            mysql(sessionTable).count('open_id as hasUser').where({
                open_id: openId
            })
                .then(function (res) {
                    // 如果存在用户就更新session
                    if (res[0].hasUser) {
                        return mysql(sessionTable).update(sessionData).where({
                            open_id: openId
                        });
                    }
                    // 如果不存在用户就新建session
                    else {
                        sessionData.open_id = openId;
                        return mysql(sessionTable).insert(sessionData);
                    }
                })
                .then(function () {
                    res.json({
                        skey: skey
                    });
                })
                .catch(e => {
                    res.json({
                        skey: null
                    });
                });

        } else {
            res.json({
                skey: null
            });
        }
    });

});


//////////////////////

var newid;
router.post('/postzhuce', function (req, res, next) {

    mysql("login").count({ count: '*' })
        .then(function (result) {
            newid = result[0].count + 1;
            next();

        });


});
router.post('/postzhuce', function (req, res, next) {



    var insertData = {
        avid: newid, //记得修改主键
        ming:req.body.ming,
        xuexiao:req.body.xuexiao,
        mima:req.body.mima,
        zhanghao:req.body.zhanghao,
        touxiang:req.body.picture,
        ds : ""
    }

    mysql("login").where({
        zhanghao: req.body.zhanghao
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                res.status(400).json({
                    error: '重名'
                });
            }
            else {
                ////没有重名，插入
                mysql("login").insert(insertData)
                    .then(function (result) {
                        res.end("ok");
                    });
            }
        });




});

router.post('/postdenglu', function (req, res, next) {

    var mima= req.body.mima;
    var zhanghu= req.body.zhanghu;
    var response;

    mysql("login").where({        //找是否有 本用户-本问题 关注记录
        zhanghao: zhanghu,
        mima: mima
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                res.json({avid:result[0].avid});
            }
            else {
                res.status(400).json({
                    error: '用户名或密码错误'
                });
            }
        });

});


router.post('/getxinxi', function (req, res, next) {

    var avid = req.body.avid;


    mysql("login").where({
        avid:avid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                res.json({
                    touxiang:result[0].touxiang,
                    ming:result[0].ming
                });
            }
            else {
                res.status(400).json({
                    error: '用户名或密码错误'
                });
            }
        });

});

///upload_ds
//更新打赏码
router.post('/upload_ds', function (req, res, next) {



    var updateData = {
        ds: req.body.picture,

    };


    mysql('login').where({
        avid: req.body.avid
    }).update(updateData)
        .then(function () {
            res.json(updateData);
        });

});

module.exports = router;

