var config = require('../../config');

Page({
  data: {
    cover: '/images/moren.png',  //封面
    title: '',  //存放idea名字
    detail: ''  //存放idea描述 
  },

  onLoad: function () {

  },


  onShow: function () {


  },


  formSubmit: function (e) {

    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({ title: e.detail.value.title.trim() });
    this.setData({ detail: e.detail.value.detail.trim() });

    if (this.data.title == "" || this.data.detail == "" ) 
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
      title: 'Publishing idea',
      mask: true
    });

    getApp().request({

      url: '/idea/postidea',
      method: 'post',
      data: {
        title: that.data.title,
        detail: that.data.detail,
        cover: that.data.cover,
        group_id: getApp().globalData.userInfo.avid
      },
      success: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: 'Successfully published, jump to the new article~',
          icon: 'none',
          duration: 3000,
          success: function () {
            setTimeout(function () {
              
              wx.redirectTo({
               // url: '/pages/radio/fawen/fawen?idea_id=' + res.data.idea_id
             //这里原来是新发布了一个idea之后直接跳转到发文章，现在改为跳转到idea列表10.10
                url: '/pages/radio/mydiantai/mydiantai?view_avid=' + getApp().globalData.userInfo.avid 
              })//要延时执行的代码  
            }, 500)

          }
        })

     
      }

    });

  },


  //上传图片
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

              that.setData({ cover: res.data });
              console.log(res.data)
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
  }


})
