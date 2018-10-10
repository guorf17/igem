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

router.post('/', function (req, res, next) {
    var group_id = req.body.avid;
    mysql("idea").where({          //通过open_id搜索数据表，找到对应用户记录
        group_id: group_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    response.push({
                        group_id:data.avid,
                        title: data.title,
                        cover: data.cover,
                        idea_id: data.idea_id
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

router.post('/xx', function (req, res, next) {
    var avid = req.body.avid;
    mysql("login").where({          //通过open_id搜索数据表，找到对应用户记录
        avid: avid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                res.json({
                    touxiang: result[0].touxiang,
                    ming: result[0].ming
                });
            }
            else {
                res.status(400).json({
                    error: '用户名或密码错误'
                });
            }
        });




});
router.post('/getship4', function (req, res, next) {

    var iid = req.body.iid;
    var response = [];

    mysql("radio").where({
        idea_id: iid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {

                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    response.push(data);
                }
                //将组织好的response通过res.json发出去
                res.json(response);
            }
            else {
                res.status(400).json({
                    error: '没有可获取回答'
                });
            }
        });

});
router.post('/getship3', function (req, res, next) {

    var iid = req.body.iid;

    mysql('idea').where({
        idea_id: iid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];

                res.json({
                    title: data.title,
                    cover: data.cover,
                    good_num: data.good_num,
                    avid:data.group_id

                });

            }
        });
});

var newid;

router.post('/postidea', function (req, res, next) {

    mysql("idea").count({ count: '*' })
        .then(function (result) {
            newid = result[0].count + 1;
            next();
        });

});

router.post('/postidea', function (req, res, next) {

    var Info = req.body;
    var insertData = {
        idea_id: newid,
        group_id: Info.group_id,
        title: Info.title,
        detail: Info.detail,
        cover: Info.cover,
        good_num: 0
    }



    mysql("idea").insert(insertData)
        .then(function (result) {

            res.json({ idea_id: newid });

        });

});

//////////////////////////////////发布新idea end



////点击关注idea

var newfocusid;
router.post('/focus_idea', function (req, res, next) {

    mysql("focus_idea").count({ count: '*' })
        .then(function (result) {
            newfocusid = result[0].count + 1;
            next();
        });


});
router.post('/focus_idea', function (req, res, next) {

    var Info = req.body;
    var insertData = {
        unique_id: newfocusid,
        open_id: req.session.open_id,
        idea_id: Info.idea_id
    }

    mysql("focus_idea").insert(insertData).then(function (result) {
        ///令idea关注数（good num）+1
        var updateData = {
            good_num: req.body.new_good_num,
        }

        mysql("idea").where({
            idea_id: Info.idea_id
        }).update(updateData)
            .then(function () {
                res.json(updateData);
            });
    });

});


//

/// 判断当前用户对本idea的关注状态
router.post('/focus_state', function (req, res, next) {

    var idea_id = req.body.idea_id;

    mysql("focus_idea").where({        //找是否有 本用户-本问题 关注记录
        open_id: req.session.open_id,
        idea_id: idea_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                res.json({ focus: true });
            }
            else {
                //返回未关注
                res.json({ focus: false });

            }
        });

});


///获取我关注的所有idea
var ideas=[]
router.post('/myidea', function (req, res, next) {



    mysql('focus_idea').where({
        open_id: req.session.open_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    ideas.push(
                        data.idea_id )

                }

                next();
            }
            else {
                res.status(400).json({
                    error: 'null'
                });
            }
        });
});
///进一步 获取我关注的所有idea的信息
router.post('/myidea', function (req, res, next) {


    mysql('idea').whereIn('idea_id', ideas)
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];
                    response.push(
                        {
                            idea_id: data.idea_id,
                            title: data.title,
                            detail: data.detail,
                            cover: data.cover,
                            good_num: data.good_num
                        }
                    )

                }

                res.json(response);
            }
            else {
                res.status(400).json({
                    error: 'null'
                });
            }
        });
});

module.exports = router;
