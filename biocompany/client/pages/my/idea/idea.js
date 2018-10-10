
var app = getApp()
Page({
  data: {
             hh:""
  },
 

  ///跳转到具体的idea
  bindQueTap: function (event) {
    console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var iid = event.currentTarget.dataset.iid; 
    wx.navigateTo({
      url: '../../radio/idealiebiao/idealiebiao?iid=' + iid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },
  onShow: function () {  ///获取我关注的所有idea
    var that = this;
    getApp().request({

      url: '/idea/myidea',
      method: 'post', 
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