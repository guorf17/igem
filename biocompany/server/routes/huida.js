var express = require('express');
var fs = require('fs');
var multiparty = require('multiparty');
// 腾讯云的文件存储SDK
var CosSdk = require('cos-nodejs-sdk-v5');
var router = express.Router();
var loginCheckMiddleware = require('../util').loginCheckMiddleware;
var mysql = require('../util').mysql;
var config = require('../config');

// 获取腾讯云配置
// serverHost, tunnelServerUrl, tunnelSignatureKey, qcloudAppId, qcloudSecretId, qcloudSecretKey, wxMessageToken
//var qcloudConfig = JSON.parse(fs.readFileSync('/data/release/sdk.config.json', 'utf8'));
var userTable = 'answer';

// 文件存储sdk初始化
var cos = new CosSdk({
    AppId: '1256714442',
    SecretId: 'AKIDzpT0NYDO7e4JMIvzZwwFRXUFoBMRiVAs',
    SecretKey: 'jIk29NdpEbszvfDal7MapsqdEdpsmsR0'
});

router.use(loginCheckMiddleware);  //使用用户鉴权中间件，所有匹配进入 /user下 路由的请求都会先进入此预处理中间件

router.all('*', function (req, res, next) {
    if (!req.session) {
        res.status(401).json({
            error: '未登录'
        });
        return;
    }
    next();
});
////////////////////////////////////////////////





router.post('/', function (req, res, next) {

    mysql("answer").where({          //通过open_id搜索数据表，找到对应用户记录
        feed_source_id: req.session.open_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    response.push({
                        answer_id: data.answer_id,
                        question_id: data.question_id,
                        feed_source_id: data.feed_source_id,
                        feed_source_name: data.feed_source_name,
                        feed_source_img: data.feed_source_img,
                        answer_ctnt: data.answer_ctnt,
                        good_num: data.good_num,

                        picture_num: data.picture_num
                    })

                }

                res.json(response);
            }
            else {
                res.status(400).json({
                    error: '未创建用户'
                });
            }
        });

});
module.exports = router;
