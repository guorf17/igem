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
var userTable = 'user';

// 文件存储sdk初始化
var cos = new CosSdk({
    AppId: '1256714442',
    SecretId: 'AKIDzpT0NYDO7e4JMIvzZwwFRXUFoBMRiVAs',
    SecretKey: 'jIk29NdpEbszvfDal7MapsqdEdpsmsR0'
});

////////////////////////////////////////////////【不可缺少】
///两个预处理的中间件，对req的登录状态等先进行检查，且对req进行加工处理，如填充session值。
router.use(loginCheckMiddleware);

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



var commentid;
router.post('/postcomment', function (req, res, next) {

    mysql("comment").count({ count: '*' })


        .then(function (result) {
            comment_id = result[0].count + 1;
            next();
        });
});

router.post('/postcomment', function (req, res, next) {

    var commentInfo = req.body;
    var insertData = {
        comment_id: comment_id,
        detail: commentInfo.detail,
        radio_ID:commentInfo.rid
    }


    var now_comment_num;
    //获取当前时间
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    /////获取当前时间end

    console.log(insertData)
    //四个嵌套的mysql操作
    mysql("comment").insert({ radio_ID: insertData.radio_ID, comment_id: insertData.comment_id, detail: insertData.detail, time: currentdate, open_id: req.session.open_id })
    //新增picture_num字段，用于控制 回帖楼 显示/不显示 "查看附图"字样
        .then(function (result) {

            ////修改相应的question表
            mysql("radio").where({
                radio_ID: req.body.rid
            })
                .select('*')
                .then(function (result) {
                    if (result.length > 0) {
                        var data = result[0];
                        now_comment_num = data.comment_num; //先提取出本问题的现有评论数
                        mysql("radio").where({ //令本问题评论数+1，并更新其“最新回答内容”
                            radio_ID: req.body.rid
                        }).update({ comment_num: now_comment_num + 1 })
                            .then(function () {
                                res.end("ok");
                            });
                    }
                });
            ////
            // });
        });


});
module.exports = router;
