// pages/article/article.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     wz:'',
     //bgurl:"https://colorlib.com/etc/lf/Login_v12/images/img-01.jpg"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ rid: options.rid });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  }, 
  ///点击查看大图
  zoom: function (event) {

    var that = this;
    var thisone = event.currentTarget.dataset.src;
    wx.previewImage({
      current: thisone, // 当前显示图片的http链接
      urls: that.data.pictures // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { 
    ///富文本解析
    var that = this;
    getApp().request({

      url: '/radio/getship',
      method: 'post',
      data: {
        radio_ID: that.data.rid
      },
      success: function (res) {

        that.setData({ rURL: res.data.rURL });

        if (that.data.rURL == "" || that.data.rURL == "[]") {
          wx.showToast({
            title: 'Here is empty~',
            icon: 'none',
            duration: 2000
          })
        }

        console.log(res);
        var wz = JSON.parse(that.data.rURL);
        that.setData({ wz: wz });
        //把pictures数组先解析出来，以用于zoom
        var pictures = [];
        for (var i = 0; i < wz.length; i++) {
          var data= wz[i];
          if (data._type == 'text') 
          { 
          }
          else {  //  
              pictures.push(data.content)
          }
          
        }
        that.setData({ pictures:  pictures});
       

        ///////////////
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