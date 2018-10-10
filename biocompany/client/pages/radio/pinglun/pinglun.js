//var config = require('../../config');

Page({
  data: {
    comment: '',
    comment_id: ''
  },

  onLoad: function (options) {
    this.setData({ rid: options.rid });
  },


  onShow: function () {


  },


  //点击发布回帖
  //将edit完毕的数据"detail以及一个图片URL数组，上传到数据库，以新增一条回帖记录
  formSubmit: function (e) {

    this.setData({ detail: e.detail.value.detail.trim() });
    var that = this;

    wx.showLoading({
      title: 'Posting reply',
      mask: true
    });

    getApp().request({

      url: '/comment/postcomment',
      method: 'post',
      data: {
        rid: that.data.rid,
        detail: that.data.detail,
        avatar: getApp().globalData.userInfo.avatar,
        name: getApp().globalData.userInfo.name

      },
      success: function (res) {

        wx.hideLoading();
        wx.showToast({
          title: 'Successfully published',
          icon: 'success',
          duration: 2000,
          success: function () {
            setTimeout(function () {
              //最后，记得返回刚才的页面
              wx.navigateBack({
                delta: 1
              })//要延时执行的代码  
            }, 500)

          }
        })
      }

    });

  },


  ///////////////////////////////保存edit数据  

  /*
 changedetail: function (e) { 
   //注意这里可能会没有（失焦）触发，从而点击发帖以后，回复内容为空的。
   //发布问题的也有一样的问题  //已经修复，解析见 newq.js
   this.setData({ detail: e.detail.value.trim() });
 },*/




})