var app = getApp()
Page({
  data: {
                hh:''
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

      url: '/wenti',
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

  }
   
})  