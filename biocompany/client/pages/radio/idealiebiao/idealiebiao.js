var config = require('../../../config');
Page({

  /**
  * 页面的初始数据
  */
  data: {
    title: '',

    good_num: '',
    feed: '',
    condition: true
  },

  onLoad: function (options) {  /// 通过 url: '../question/question?qid' + qid进入此处，所以这里用options.qid可以获取到前一个页面传入的参数qid 
    this.setData({ iid: options.iid });
    //console.log("ooo");
    this.setData({ myavid: getApp().globalData.userInfo.avid });

  },

  fawen: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/radio/fawen/fawen?idea_id=' + that.data.iid
    })
  },

  bindQueTap: function (event) {
    //console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var rid = event.currentTarget.dataset.rid;
    wx.navigateTo({
      url: '/pages/radio/wzxiangqing/wzxiangqing?rid=' + rid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },



  onShow: function () {
    console.log("iii");
    wx.showLoading({
      title: 'Loading',
      mask: true
    });

    var that = this;
    getApp().request({

      url: '/idea/getship4',
      method: 'post',
      data: {
        iid: that.data.iid
      },
      success: function (res) {

        wx.hideLoading();

        if (res.statusCode != 400) {
          that.setData({
            feed: res.data

          });
        }


        if (that.data.feed == "") {
          wx.showToast({
            title: 'This idea has no published posts yet~',
            icon: 'none',
            duration: 2000
          })
        }

      }

    });
    getApp().request({

      url: '/idea/getship3',
      method: 'post',
      data: {
        iid: that.data.iid
      },
      success: function (res) {

        that.setData({
          title: res.data.title,
          cover: res.data.cover,
          good_num: res.data.good_num,
          thisavid: res.data.avid
        });
      }
    });
  },

  //新增加了按钮提示2018.10.09
  //删除按钮，删除idea下的某篇文章

  deleteArticle: function (event) {
    var that = this;
    var rid = event.currentTarget.dataset.rid;
    wx.showModal({
      title: 'Tips',
      content: 'once delete,it cannot be revoked',
      cancelText: "Cancle",
      confirmText: "Delete",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //确定删除之后的操作

          getApp().request({

            url: '/idea/delarticle',
            method: 'post',
            data: {
              rid: rid
            },
            success: function (res) {
              that.onShow()
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
          //取消删除，不操作
        }
      }

    })

  },

})



