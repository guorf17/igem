var app = getApp()
Page({
  data: {
                hh:""
  },
  //事件处理函数
  bindItemTap: function () {
    wx.navigateTo({
      url: '../answer/answer'
    })
  },

  ///跳转到具体的问题页面
  bindQueTap: function (event) {
    //console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var qid = event.currentTarget.dataset.qid;
    wx.navigateTo({
      url: '../../question/question?qid=' + qid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },


 

  onShow: function () {
    this.getData2();
  },
  getData2: function () {
    var that = this;
    getApp().request({

      url: '/huida',
      method: 'post',
      data: {
        

      },
      success: function (res) {
        if (res.statusCode == 200) {
        that.setData({ hh: res.data })
        }
        if (that.data.hh == "") {
          wx.showToast({
            title: 'Here is empty~',
            icon: 'none',
            duration: 2000
          })
        }

      }

    });

  },

  //新增加了按钮提示2018.10.09
  //删除按钮，删除我的某条Comment
  deleteMyComment: function (event) {
    var that = this;
    var aid = event.currentTarget.dataset.aid;
    //新增的提示
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

            url: '/huida/delhuida',
            method: 'post',
            data: {
              aid: aid
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
  }

})  