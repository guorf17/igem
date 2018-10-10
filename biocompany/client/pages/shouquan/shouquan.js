// pages/shouquan/shouquan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },
  bindGetUserInfo: function (e) {
    var that = this;
    //此处授权得到userInfo
    console.log(e.detail.userInfo);
    //接下来写业务代码
    getApp().globalData.userInfo.first_login = true; //初次登录
    //最后，记得返回刚才的页面
    wx.navigateBack({
      delta: 1
    })
  }
})