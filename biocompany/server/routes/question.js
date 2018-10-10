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
////////////////////////////////////////////////

//获取问题概述表的长度
router.get('/', function (req, res, next) {

    var reqid = req.body.reqid;
    var response;

    mysql("question").count({ count: '*' })   //此处用count({count:'*'})这种写法而不用count(*)，否则，后面再result里要获取count值的时候，sql库自动设置变量名因为是count(*)，所以写在代码里会识别不了，从而提取不出来，这里用这种写法给这个变量重命名为count，后面就可以提取出它了
        .then(function (result) {
            //res.json({reqid:result});
            res.json({ reqid: result[0].count });  //注意 这里的result是用数组的形式给到then函数的，所以这里必须还是用[0]才能取出count值，否则 在前端that.setData的时候，所得到的reqid内存放结果不会是想要的一个数字，而会是一个数组,数组里是是一个含count变量的对象
        });

});

//获取问题概述
router.post('/', function (req, res, next) {

    var reqid = req.body.reqid;
    var response;

    mysql("question").whereIn('question_id', [reqid - 7, reqid - 6, reqid - 5, reqid - 4, reqid - 3, reqid - 2, reqid - 1, reqid]) //取用从reqid向上的8条问题概述//因为要倒序显示最新的话题
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
                        question_id: data.question_id,
                        answer_id: data.answer_id,
                        feed_source_id: data.feed_source_id,
                        feed_source_name: data.feed_source_name,
                        feed_source_txt: data.feed_source_txt,
                        feed_source_img: data.feed_source_img,
                        question: data.question,
                        answer_ctnt: data.answer_ctnt ,
                        good_num: data.good_num,
                        comment_num: data.comment_num
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



//////////////////////////////////发布新问题 post /postquestion
//功能：即在question和question_pictures表格里insert一条新的记录

//注意，此是拆分为几部分实现的（下面[1][2][3]三个部分），每个部分（step）之间使用next()来进行连接
//原因：一开始尝试将三个部分写在一个 post /postquestion {} 里，但是发现不能正常工作，通过调试发现里面执行完[1][2]到达[3]的时候，要赋值的变量似乎还是undefined，发现其实比如运行到了[3]的时候，是没有进入到[1]的mysql语句里的then{}的，通过推测，发现这可能是"异步运行"问题，即mysql总是先直接向SQL发布操作指令，然后向下异步执行到下一句mysql，所以此时可能执行到[3]的时候，[1]那句mysql还没成功完成操作，所以没能进入其then，所以导致执行到[3]时候，newqid还没能被成功赋值。
//因此，我们无法直接将三个部分(三个sql)写在一个处理函数内。
//而必须分开写成三部分如下，各部分通过next()连接，从而保证三个部分是严格正确被先后执行的（即进行了同步

var newqid;//[1]先从question表格里确定，现有question条数，从而给本question赋值id
var newqpid;//再从question_picture表格里确定，现有记录条数，从而给后续插入各条附图记录赋值id//必须新增此主键，question_picture表格才能进行删/改。
router.post('/postquestion', function (req, res, next) {

    mysql("question").count({ count: '*' })
        .then(function (result) {
            newqid = result[0].count + 1;

            mysql("question_picture").count({ count: '*' })
                .then(function (result) {
                    newqpid = result[0].count + 1;
                    next();
                });

        });

    //接着，向 问题概述表格 和 问题详情表格 各自插入一条新记录。
    //ps暂时不分开用两个表格了，而只用一个问题表格
    //然后另外用一个表格，来存储所有的回帖，每个记录（回帖）有一个字段来标志该回帖属于哪个问题ID
    //同理，用另外一个表格，来存储所有的问题描述图片,每个记录有两个字段  问题ID,URL地址
    //由此，来解决，一个问题的 帖子/描述图片 可能是不定个数的问题（而其实此时的question表格也就只是question概述就好了）

});

//[2]查用户表，获取发布问题的用户的名字和头像(用于下方插入question记录)
var name = ''; var avatar = '';
router.post('/postquestion', function (req, res, next) {

    mysql(userTable).where({          //通过open_id搜索数据表，找到对应用户记录
        open_id: req.session.open_id
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                var data = result[0];
                console.log(data);
                name = data.name;
                avatar = data.avatar;
                next();
            }
        });
});

//[3]向两个表格里插入新记录
router.post('/postquestion', function (req, res, next) {

    var questionInfo = req.body;
    var insertData = {
        title: questionInfo.title,
        detail: questionInfo.detail,
        pictures: questionInfo.pictures
    }


    var newrows = [];
    for (var i = 0; i < insertData.pictures.length; i++) {
        var newrow = { unique_id: newqpid + i, question_id: newqid, img: insertData.pictures[i] };
        newrows.push(newrow);
    }
    console.log(newrows);

    /*
      //开始insert问题记录 //示例：knex('books').insert({title: 'Slaughterhouse Five'})
      mysql("question").insert({ question_id: newqid, feed_source_id: req.session.open_id, question: insertData.title, question_detail: insertData.detail, good_num: 0, comment_num: 0, answer_ctnt: '', feed_source_name: name, feed_source_img: avatar })
      .then(function (result) {
        //next();
      });

      //先写了在for里执行多次mysql insert，发现只能插入一条记录,所以改为如下，一次插入多条记录
      //其实后来发现原因主要可能是，question_picture表格的结构问题，一开始把questionid设置成主键了，所以这里肯定 对于一个问题只能够插入一条，所以上述对同一个问题多个图片的插入，结果就只能插入一条 id-url记录了。
      //改了表格结构，不设置主键以后，测试下面的写法，也才能成功运行了。


      mysql("question_picture").insert(newrows).then(function (result) {
        res.end("ok"); //next();
      });*/

    //注意只写mysql().insert();似乎不能正常工作，即后面还是需要补上一个then{}
    // res.end("ok"); 写在两句mysql外面似乎也不能正常工作，而需要写在then里面。（猜测写在外面，可能是：mysql还没成功被执行(进入then)，就直接执行了res.end，从而mysql命令就被中断了？）
    //所以 其实上面两句mysql这样写在一起，而不把第二个mysql写在第二个mysql的then里面，可能是有风险的。
    //其实，应该也可以不将这两句mysql分拆在两个post('/postquestion'内，只需要将这两句直接嵌套，将把第二个mysql写在第二个mysql的then里面，在第二个mysql的then里写res.end，就可以了√？如下
    mysql("question").insert({ question_id: newqid, feed_source_id: req.session.open_id, question: insertData.title, question_detail: insertData.detail, good_num: 0, comment_num: 0, answer_ctnt: '', feed_source_name: name, feed_source_img: avatar })
        .then(function (result) {
            mysql("question_picture").insert(newrows).then(function (result) {
                res.end("ok");
            });
        });

    //注意，虽然此处只需要执行insert，不需要返回数据，但是此处理函数必须进行response，否则，此请求会悬挂，客户端收不到response则也进不了success，则一直在加载中。

});

//////////////////////////////////发布新问题end

//
///用户上传图片到cos：（上传问题图片）
router.post('/UploadPicture', function (req, res, next) {

    // 用于解析文件上传
    var form = new multiparty.Form({
        encoding: 'utf8',
        autoFiles: true,
        uploadDir: '/tmp'
    });

    form.parse(req, function (err, fields, files) {

        if (err) {
            next(err);
        }
        else {
            var avatarFile = files.avatar[0];
            var fileExtension = avatarFile.path.split('.').pop();
            var fileKey = parseInt(Math.random() * 10000000) + '_' + (+new Date) + '.' + fileExtension;

            var params = {
                //todo
                Bucket: config.cos.fileBucket,
                //ap-guangzhou
                Region: config.cos.region,
                Key: fileKey,
                Body: fs.readFileSync(avatarFile.path),
                ContentLength: avatarFile.size
            };

            cos.putObject(params, function (err, data) {//上传文件到cos
                fs.unlink(avatarFile.path);// 删除临时文件
                if (err) {
                    next(err);
                    return;
                }
                res.end("https://"+data.Location); //经单步调试，发现成功执行完这个 Ends the response process 的步骤了
                //console.log(data); 虽然res.end了 这一句似乎也是会被执行到的。
            });

        }

    });

});


////根据qid，查询并返回该问题发布时上传的图片
router.post('/picture', function (req, res, next) {

    var qid = req.body.qid;

    mysql('question_picture').where({          //通过qid搜索数据表，找到对应记录
        question_id: qid
    })
        .select('*')
        .then(function (result) {
            if (result.length > 0) {
                response = [];
                for (var i = 0; i < result.length; i++) {
                    var data = result[i];

                    response.push(
                        data.img
                    )

                }
                //将组织好的response通过res.json发出去
                res.json(response);
            } else {
                res.status(400).json({
                    error: '没有可获取问题了'
                });
            }
        });
});

////根据query，查询并返回所有匹配的问题
router.post('/search', function (req, res, next) {

    var query = req.body.query;

    mysql('question').where('question', 'like', '%' + query + '%')
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

////点击关注问题
var newfocusid;
router.post('/focus_question', function (req, res, next) {

    mysql("focus_question").count({ count: '*' })
        .then(function (result) {
            newfocusid = result[0].count + 1;
            next();
        });


});
router.post('/focus_question', function (req, res, next) {

    var questionInfo = req.body;
    var insertData = {
        unique_id: newfocusid,
        open_id: req.session.open_id,
        question_id: questionInfo.qid,
        question: questionInfo.title,
        answer_ctnt: questionInfo.answer_ctnt
    }

    mysql("focus_question").insert(insertData).then(function (result) {
        res.end("ok");
    });

});

module.exports = router;
