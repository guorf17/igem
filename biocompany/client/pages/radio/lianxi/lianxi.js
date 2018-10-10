Page({

  /**
   * 页面的初始数据
   */
  data: {

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

  },
  into_dashang: function () {

    //注意，必须用previewImage来显示我们的赞助二维码图片，才能在真机上长按时出现“识别二维码”的选项，如果用 image标签来显示我们的 赞助二维码图片，长按它是没有反应的。（ps，直接用赞助二维码图片则可，不需要用base64格式
    wx.previewImage({
      current: "https://resource-1256714442.cos.ap-guangzhou.myqcloud.com/z.jpg", // 当前显示图片的http链接  
      urls: ["https://resource-1256714442.cos.ap-guangzhou.myqcloud.com/z.jpg"]// 需要预览的图片http链接列表  
    })
  }

})