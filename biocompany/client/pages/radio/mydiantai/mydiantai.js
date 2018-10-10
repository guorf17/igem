var config = require('../../../config');

///本页修改为电台页面（而不只是 我的电台 页面） 20180606

Page({

  /**
  * 页面的初始数据
  */
  data: {
    feed: "",
    //avid:'',
    ming:'',
    touxiang:'',
    condition: true,
    ////// 指引页面
    hiddenModal: true,
    imgUrls: [
      '/images/guide1.jpg', '/images/guide2.jpg', '/images/guide3.jpg', '/images/guide4.jpg', '/images/guide5.jpg', '/images/guide6.jpg'
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000

  }, 
  listenerConfirm: function () {
    this.setData({
      hiddenModal: true
    })
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
              //服务器返回上传图片的URL地址，将其add到页面的内部状态变量picture中

              that.setData({ picture: res.data });
              ////再将picture更新到本用户的赞赏码属性
              getApp().request({

                url: '/login/upload_ds',
                method: 'post',
                data: {
                  avid: that.data.thisavid,
                  picture: that.data.picture
                },
                success: function (res) {

                  wx.showToast({
                    title: 'Reward code updated',
                    icon: 'success',
                    duration: 2000
                  })

                }

              });
            }
            else {
              wx.showToast({
                title: 'The image is too large, the upload failed, please re-upload',
                icon: 'none',
                duration: 2000
              })
            }
          }
        });

      }
    });
  },
 
  upload_ds: function (e) {
    var that = this;
    /////// 判断是否是第一次上传赞善码
    //即 ds = "" 时，显示指引页  ///在指引页确认后再进入上传步骤
    if(this.data.ds=="")
    {
      this.setData({
        hiddenModal: false
      }) }

    else {  ///否则正常上传
       
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
                //服务器返回上传图片的URL地址，将其add到页面的内部状态变量picture中

                that.setData({ picture: res.data });
                ////再将picture更新到本用户的赞赏码属性
                getApp().request({

                  url: '/login/upload_ds',
                  method: 'post',
                  data: {
                    avid: that.data.thisavid,
                    picture: that.data.picture
                  },
                  success: function (res) {

                    wx.showToast({
                      title: 'Reward code updated',
                      icon: 'success',
                      duration: 2000
                    })

                  }

                });
              }
              else {
                wx.showToast({
                  title: 'The image is too large, the upload failed, please re-upload',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          });

        }
      });
    }
    ////////////////////////
   
  },


  

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
 
    this.setData({ thisavid: options.view_avid }); //要访问的本页的avid
    this.setData({ myavid: getApp().globalData.userInfo.avid });  //访问者的avid

    

      //////////////// 判断是否是第一次上传赞善码

    
    
    
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
    this.getData2();
    this.getData();
    var that = this;
    if (this.data.thisavid == this.data.myavid) {
      getApp().request({

        url: '/radio/getship3',
        method: 'post',
        data: {
          avid: that.data.myavid
        },
        success: function (res) {

          that.setData({ ds: res.data.ds });
        }

      });
    }
   
  },
  bindQueTap: function (event) {
    //console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var iid = event.currentTarget.dataset.iid; // 
   // console.log(iid);
    wx.navigateTo({
      url: '../idealiebiao/idealiebiao?iid=' + iid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },
  getData: function () {
    var that = this;
   
    getApp().request({
     
      
      url: '/idea',
      method: 'post',
      data: {
        avid: that.data.thisavid
      },
      success: function (res) {
        //console.log(res)
        if (res.statusCode != 400) {
          //that.setData({ feed: res.data.data, avid: res.data.avid });
          that.setData({ feed: res.data});
        }

        if ((that.data.feed == "")&&(that.data.thisavid == that.data.myavid))
        {
          wx.showToast({
            title: 'The list of ideas is empty, go and post it~',
            icon: 'none',
            duration: 2000
          })
        }
      }

    });

  },
  getData2: function () {
    var that = this;
   
    getApp().request({


      url: '/idea/xx',
      method: 'post',
      data: {
        avid: that.data.thisavid
      },
      success: function (res) {
        if (res.statusCode != 400) {
          that.setData({ touxiang: res.data.touxiang, ming: res.data.ming });
        }
      }

    });

  },
    //新增加了按钮提示2018.10.09
  //删除按钮，删除我的团队里某个idea
  deleteIdea: function (event) {
    var that = this;
    var iid = event.currentTarget.dataset.iid;
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

            url: '/radio/delidea',
            method: 'post',
            data: {
              iid: iid
            },
            success: function (res) {

              that.onShow()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          //取消删除，不操作
        }
      }

    })

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