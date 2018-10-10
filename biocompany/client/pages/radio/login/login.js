Page({

  /**
   * 页面的初始数据
   */
  data: {

  },


  tozhuce: function () {
    wx.navigateTo({
      url: '/pages/radio/zhuce/zhuce',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  formSubmit: function (e) {

    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({ mima: e.detail.value.mima.trim() });
    this.setData({ zhanghu: e.detail.value.zhanghu.trim() });

    var that = this;

    wx.showLoading({
      title: 'Logging in',
      mask: true
    });

    getApp().request({

      url: '/login/postdenglu',
      method: 'post',
      data: {
        mima: that.data.mima,
        zhanghu: that.data.zhanghu

      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          wx.showToast({
            title: 'Landed successfully',
            icon: 'success',
            duration: 1500,
            success: function () {
              setTimeout(function () {
                //最后，记得返回刚才的页面
                wx.navigateBack({
                  delta: 1
                })//要延时执行的代码  
              }, 500)

            }

          })
          that.setData({
            avid: res.data.avid

          });
          getApp().globalData.userInfo.avid = res.data.avid;


        }
        else {
          wx.showToast({
            title: 'wrong user name or password',
            icon: 'none',
            duration: 2000
          })
        }
      }

    });

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})