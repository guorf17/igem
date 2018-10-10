var config = require('../../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictures:"/images/icons/weidenglu.png"
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
  UploadPicture: function (e) {

    var that = this;

    wx.chooseImage({
      success: function (res) {

        wx.showLoading({
          title: 'Uploading image',
          mask: true
        });

        wx.uploadFile({
          header: {
            skey: wx.getStorageSync('skey')
          },
          url: config.host + '/question/UploadPicture',
          filePath: res.tempFilePaths[0],
          name: 'avatar', //若改掉此，则后台的post UploadPicture函数也要进行相应的修改，否则在该函数内会提取不到图片，从而上传失败
          success: function (res) {
            if (res.statusCode == 200) {
              wx.hideLoading();
              //服务器返回上传图片的URL地址，将其add到页面的内部状态变量pictures中
             
              that.setData({ pictures: res.data });
            }
            else {
              wx.showToast({
                title: 'The image is too large, the upload failed, please re - upload',
                icon: 'none',
                duration: 2000
              })
            }
          }
        });

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

  formSubmit: function (e) {

 
    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({ ming: e.detail.value.ming.trim() });
    this.setData({ xuexiao: e.detail.value.xuexiao.trim() });
    this.setData({ zhanghao: e.detail.value.zhanghu.trim() });

    this.setData({ mima: e.detail.value.mima.trim() });

    if (this.data.ming == "" || this.data.xuexiao == "" || this.data.zhanghao == "" || this.data.mima == "")
    {
      wx.showToast({
        title: 'Filled in unfinished, cannot be submitted',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var that = this;

    wx.showLoading({
      title: 'Registering',
      mask: true
    });

    getApp().request({

      url: '/login/postzhuce',
      method: 'post',
      data: {
        mima: that.data.mima,
        zhanghao: that.data.zhanghao,
        ming: that.data.ming,
        xuexiao: that.data.xuexiao,
        picture: that.data.pictures

      },
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          wx.showToast({
            title: 'Registration Success',
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
        else if (res.statusCode == 400) {
          wx.showToast({
            title: 'This username has been registered',
            icon: 'none',
            duration: 2000
          })
        }
        else {
          //未知失败
        }
      
      }

    });

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