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

router.get('/', function (req, res, next) {

    var reqid = req.body.reqid;
    var response;

    mysql("radio").count({ count: '*' })   //此处用count({count:'*'})这种写法而不用count(*)，否则，后面再result里要获取count值的时候，sql库自动设置变量名因为是count(*)，所以写在代码里会识别不了，从而提取不出来，这里用这种写法给这个变量重命名为count，后面就可以提取出它了
        .then(function (result) {
            //res.json({reqid:result});
            res.json({ reqid: result[0].count });  //注意 这里的result是用数组的形式给到then函数的，所以这里必须还是用[0]才能取出count值，否则 在前端that.setData的时候，所得到的reqid内存放结果不会是想要的一个数字，而会是一个数组,数组里是是一个含count变量的对象
        });

});

/////////////
var end;
router.post('/', function (req, res, next) {

    mysql("radio").count({ count: '*' })
        .then(function (result) {
            end = result[0].count;
            next();
        });
});
router.post('/', function (req, res, next) {

    var reqid = req.body.reqid;
    var response;

    /////生成随机数
    var  random=[];
    var length = end - 1 +1;
    for (var i = 0; i < 8; i++)  //注意 生成的8个随机数可能有重复的，所以此处不一定正好返回随机的8个视频
    {
        var Range = end - 1;
        var Rand = Math.random();
        var num = 1 + Math.round(Rand * Range); //四舍五入
        random.push(num);
    }

    //////
    mysql("radio").whereIn('radio_ID', random) //取用从reqid向上的8条问题概述//因为要倒序显示最新的话题
    ///【注意，发现在我们的项目中出现了bindscrolltolower不触发的问题，所以下拉获取不到新数据，参考下述网址，发现原因可能是：如果wx:for的list撑满屏幕滚动和下拉刷新都没问题，但是list数据过少时，bindscrolltoupper和bindscroll都无效。所以经测试发现确实是，在我们的项目里，如果一开始初始页面的问题概述数太少（不够源代码的8条），则bindscroll是根本无法被触发的】
    //上述问题参考：https://developers.weixin.qq.com/blogdetail?action=get_post_info&docid=0008e65e7bc9c8d0a9968d8a451c00&highline=bindscrolltolower%20
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                response = { id: reqid - result.length, data: [] };
                for (var i = 0; i < result.length; i++)//循环取用获取到的每一条记录，组织放入response中，response 被组织为一个对象，该对象内有两个属性{id,data}，其中id返回一个值，data返回一个list，list内各个对象是各个问题概述（也即每一条记录）
                {
                    var data = result[i];

                    response.data.push({

                        coverImg: data.coverImg,
                        title: data.title,
                        view_num: data.view_num,
                        comment_num: data.comment_num,

                        avid: data.avid,
                        radio_ID:data.radio_ID,

                    })

                }
                //将组织好的response通过res.json发出去
                res.json(response);
            }
            else {
                res.status(400).json({
                    error: '没有可获取问题了'
                });
            }
        });

});

var newid;
router.post('/fawen', function (req, res, next) {

    mysql("radio").count({ count: '*' })
        .then(function (result) {
            newid = result[0].count + 1;
            next();

        });


});

router.post('/fawen', function (req, res, next) {

    var shipURL = req.body.shipURL;
    var wzURL = req.body.wzURL;
    var url; var rtype;

    if (shipURL == '') {
        rtype = 'wz';
        url = wzURL;
    }
    else {
        rtype = 'sp';
        url = shipURL;
    }



    var insertData = {

        radio_ID: newid,
        avid: req.body.avid,
        idea_id: req.body.idea_id,
        title: req.body.title,
        coverImg: req.body.cover,
        rtype: rtype,
        rURL: url,
        comment_num:0,
        view_num:0

    }



    mysql("radio").insert(insertData)
        .then(function (result) {
            res.end("ok");
        });


});



////根据query，查询并返回所有匹配的问题
router.post('/search', function (req, res, next) {

    var query = req.body.query;

    mysql('radio').where('title', 'like', '%' + query + '%')
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];

                    response.push(data)

                }
                //将组织好的response通过res.json发出去
                res.json(response);
            } else {
                res.status(400).json({
                    error: '没有匹配问题'
                });
            }
        });
});

router.post('/getship', function (req, res, next) {

    var radio_ID = req.body.radio_ID;

    mysql('radio').where({
        radio_ID: radio_ID
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];
                var rURL = data.rURL;
                res.json({ rURL: rURL });

            }
        });
});

//获取日志的信息
router.post('/getship2', function (req, res, next) {

    var radio_ID = req.body.radio_ID;

    mysql('radio').where({
        radio_ID: radio_ID
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];

                var rURL=data.rURL;
                var avid= data.avid;
                var title= data.title;
                var rtype= data.rtype;
                var idea_id=data.idea_id;

                mysql('idea').where({
                    idea_id: idea_id
                })
                    .select('*')
                    .then(function (result) {
                        if (result.length > 0) {
                            var data = result[0];

                            var idea_title = data.title;
                            var good_num = data.good_num;
                            var idea_id = data.idea_id;


                            res.json({
                                rURL: rURL,
                                avid: avid,
                                title: title,
                                rtype: rtype,
                                idea_id: idea_id,
                                idea_title: idea_title,
                                good_num: good_num
                            });

                        }
                    });

            }
        });
});

//获取日志所属电台的信息
router.post('/getship3', function (req, res, next) {

    var avid = req.body.avid;

    mysql('login').where({
        avid: avid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];

                res.json({
                    touxiang: data.touxiang,
                    ming: data.ming,
                    xuexiao:data.xuexiao,
                    ds: data.ds
                });

            }
        });
});

//获取日志的评论信息
router.post('/getship4', function (req, res, next) {

    var radio_ID = req.body.radio_ID;
    var response = [];

    mysql('comment').where({
        radio_ID: radio_ID
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {

                var ii = 0;
                for (var i = 0; i < result.length; i++) {
                    // var data = result[i];


                    mysql('user').where({
                        open_id: result[ii].open_id
                    })
                        .select('*')
                        .then(function (nresult) {
                            if (nresult.length > 0) {
                                var ndata = nresult[0];

                                var name = ndata.name;
                                var avatar = ndata.avatar;


                                result[ii].name= name;
                                result[ii].avatar = avatar;
                                response.push(result[ii]);
                                ii = ii+1;


                                if (ii == result.length)
                                {//将组织好的response通过res.json发出去
                                    res.json(response);}
                            }
                        });



                }

            }
            else {
                res.status(400).json({
                    error: '没有可获取回答'
                });
            }
        });
});
router.post('/getship6', function (req, res, next) {

    var open_id = req.body.open_id;

    mysql('user').where({
        open_id: open_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];

                res.json({
                    name: data.name,
                    avatar: data.avatar

                });

            }
        });
});



module.exports = router;
