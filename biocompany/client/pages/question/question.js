 //answer.js
//var util = require('../../utils/util.js')

var app = getApp()
Page({
  data: {
    qid: -1,
    question_detail: {},
    answers: [],  //存放回答数组，其中每个元素在wxml渲染出一个回答框
    focus_q: false //标志本用户是否关注此问题
  },


  onLoad: function (options) {  /// 通过 url: '../question/question?qid' + qid进入此处，所以这里用options.qid可以获取到前一个页面传入的参数qid 
    this.setData({ qid: options.qid });
    this.addview();

  },

  

  onShow: function (options) {
    this.LoadQuestion();
    this.LoadAnswer();

  },

  LoadQuestion: function () {

    //向后台传入qid，以从服务端获取到question表里的这个question的所有详细字段，以渲染显示
    ///////
    /*wx.showLoading({
      title: '加载中',
      mask: true
    });*/

    var that = this;
    getApp().request({

      url: '/question_detail',  /// 加一个，判断当前用户对本问题的关注状态
      method: 'post',
      data: {
        qid: that.data.qid
      },
      success: function (res) {
        //wx.hideLoading();

        that.setData({
          question_detail: res.data,

        });

        /// 判断当前用户对本问题的关注状态
        getApp().request({

          url: '/question_detail/focus_state',
          method: 'post',
          data: {
            qid: that.data.qid
          },
          success: function (res) {

            if (res.statusCode == 200) {
              that.setData({
                focus_q: res.data.focus_q
              });
            }

          }

        });
      }

    });

  },
  LoadAnswer: function () {
    ///////
    /*wx.showLoading({
      title: '加载中',
      mask: true
    });*/

    var that = this;
    getApp().request({

      url: '/answer',
      method: 'post',
      data: {
        qid: that.data.qid
      },
      success: function (res) {
        //wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            answers: res.data
          });
        } else {
          that.setData({
            answers: []
          });
        }

      }

    });
  },


  //不要answer详情页面了，在question页面的回答部分里，将每一个回答的txt内容都就直接详细打印出，然后在每个回答楼，也增加一个“查看附图”按钮，就好了
  //这样也避免了 文字-图片-文字-图片的 问题

  //跳转到发帖回复
  answer: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/newa/newa?qid=' + that.data.qid
    })
  },
  //查看(问题)附图√
  see_pictures: function () {
    var that = this;
    wx.navigateTo({
      url: '../picture/picture?type=question&qid=' + that.data.qid
    })

  },
  //查看(答案)附图 //√
  see_answer_pictures: function (event) {
    //先从点击获取answerid
    var aid = event.currentTarget.dataset.aid;
    var that = this;
    wx.navigateTo({
      url: '../picture/picture?type=answer&aid=' + aid
    })

  },
  /*
  seeinfor: function (event) { //跳转到被点击用户的个人信息页面
    var userid = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/user_info/user_info?userid=' + userid
    })
  },*/

  //令浏览数+1
  addview: function () {
    var that = this;

    getApp().request({

      url: '/question_detail',
      method: 'post',
      data: {
        qid: that.data.qid
      },
      success: function (res) {  //先拿到旧的 本问题浏览数
        //wx.hideLoading();

        that.setData({
          question_detail: res.data
        });
        getApp().request({ //再发出请求令浏览数+1

          url: '/question_detail/addview',
          method: 'post',
          data: {
            new_good_num: that.data.question_detail.good_num + 1,
            qid: that.data.qid
          },
          success: function (res) {

          }

        });

      }

    });

  },
  ///点击关注本问题
  focus_question: function () {
    wx.showLoading({
      title: 'Following the topic',
      mask: true
    });
    var that = this;
    getApp().request({

      url: '/question/focus_question',
      method: 'post',
      data: {
        qid: that.data.qid,
        title: that.data.question_detail.question,
        answer_ctnt: that.data.question_detail.answer_ctnt
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            focus_q: true
          });
        }
        else {
          console.log("Follow failure")
        }

      }

    });

  }
})