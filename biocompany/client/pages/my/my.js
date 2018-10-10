var util = require("../../utils/utils.js");
var app = getApp();

Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  onLoad: function () {
    
  },
  onShow: function () {
    this.setData({ avatar: getApp().globalData.userInfo.avatar });
    this.setData({ name: getApp().globalData.userInfo.name });
  
  },
  //事件处理函数
  click_readme: function () {
    wx.navigateTo({
      url: '/pages/me/me'
    })
  }, 
  click_my_question: function () {
    wx.navigateTo({
      url: '/pages/my/xinxi/xinxi'
    })
  },
  click_my_idea: function () {
    wx.navigateTo({
      url: '/pages/my/idea/idea'
    })
  },
  click_my_answer: function () {
    wx.navigateTo({
      url: '/pages/my/huida/huida'
    })
  },
  click_my_notice_question: function () {
    wx.navigateTo({
      url: '/pages/my/wenti/wenti'
    })
  }

})

 