// pages/user_infor/user_infor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid: "",//当前用户的openID
    infor: {}, //当前用户个人信息
    focus_u: false //标志本用户是否关注此人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ userid: options.userid });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getinfor(); //根据用户id，向服务端获取此用户的data，以渲染显示出其个人信息页面

  },
  getinfor: function () {
    var that = this;
    wx.showLoading({
      title: 'Loading',
      mask: true
    });
    getApp().request({

      url: '/user/see_user',
      method: 'post',
      data: {
        userid: that.data.userid
      },
      success: function (res) {

        that.setData({
          infor: res.data
        });
        that.getfocus(); //判断是否关注了本用户
      }

    });
  },
  getfocus: function () {
    var that = this;

    /// 判断当前用户对本问题的关注状态
    getApp().request({

      url: '/user/focus_state',
      method: 'post',
      data: {
        userid: that.data.userid
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            focus_u: res.data.focus_u
          });
        }

      }

    });
  },
  focus_user: function (options) {
    wx.showLoading({
      title: 'Following',
      mask: true
    });
    var that = this;
    getApp().request({

      url: '/user/focus_user',
      method: 'post',
      data: {
        userid: that.data.userid
      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            focus_u: true
          });
        }
        else {
          wx.showToast({
            title: res.data.error,
            icon: "none",
            duration: 2000
          })
        }

      }

    });

  }
})