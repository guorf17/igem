var config = {
  Bucket: 'todo-1256714442',//replace with yours
  Region: 'ap-guangzhou',//replace with yours
  SecretId: 'AKIDzpT0NYDO7e4JMIvzZwwFRXUFoBMRiVAs',//replace with yours
  SecretKey: 'jIk29NdpEbszvfDal7MapsqdEdpsmsR0'//replace with yours
} 



//index.js
var COS = require('../../../lib/cos-wx-sdk-v5')

var option = {
  data: {
    rid: '',
    comments: [],
    rURL: '',
    avid: '',
    touxiang: '',
    ming: '',
    xuexiao:'',
    open_id:''
  },
};






option.onShareAppMessage = function (res) {
   
  return {
    title: "This idea is super fun!",
    //imageUrl
  }
}



option.onLoad = function (options) {  /// 通过 url: '../question/question?qid' + qid进入此处，所以这里用options.qid可以获取到前一个页面传入的参数qid 
  this.setData({ rid: options.rid });
  /*getApp().checkLogin(function () {

  });  */   ///会影响global data 的avid，导致回到主页的时候进不了我的团队

  wx.hideLoading();

};
option.bindQueTap = function () {   
  wx.navigateTo({
    url: '../pinglun/pinglun?rid=' + this.data.rid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
  })
},

 
option.onShow = function () {
 
  var that = this;
  getApp().request({

    url: '/radio/getship2',
    method: 'post',
    data: {
      radio_ID: that.data.rid
    },
    success: function (res) {
      //console.log(res)

      that.setData({ 
        rURL: res.data.rURL,
        avid: res.data.avid,
        title:res.data.title,
        idea_id: res.data.idea_id,
        idea_title: res.data.idea_title,
        good_num: res.data.good_num,
        rtype: res.data.rtype
      });

      if (that.data.good_num>=1000)
      {
        that.setData({
          ex_good_num: (that.data.good_num / 1000).toFixed(1) + "k"
        });
        
      }

      getApp().request({

        url: '/radio/getship3',
        method: 'post',
        data: {
          avid: that.data.avid
        },
        success: function (res) {

          that.setData({
            touxiang: res.data.touxiang,
            ming: res.data.ming,
            xuexiao: res.data.xuexiao,
            ds: res.data.ds
          });

        }

      });

      ////判断focus状态
      getApp().request({

        url: '/idea/focus_state',
        method: 'post',
        data: {
          idea_id: that.data.idea_id
        },
        success: function (res) {

          that.setData({
            focus: res.data.focus
          });

        }

      });
      
    }

  });
  

  
  
  getApp().request({

    url: '/radio/getship4',
    method: 'post',
    data: {
      radio_ID: that.data.rid
    },
    success: function (res) {
   
     //   console.log(res)
     if(res.statusCode!=400){
       that.setData({
         comments: res.data

       });
     }
      
    
    }

  });
   
  
};
 

 
///点击关注本问题
option.focus = function () {
  wx.showLoading({
    title: 'Following',
    mask: true
  });
  var that = this;
  getApp().request({

    url: '/idea/focus_idea',
    method: 'post',
    data: {
      idea_id: that.data.idea_id,
      new_good_num: that.data.good_num+1
    },
    success: function (res) {
      wx.hideLoading();
      if (res.statusCode == 200) {
        that.setData({
          focus: true,
          good_num:that.data.good_num + 1
        });
      }
      else {
        console.log("Follow failure")
      }

    }

  });


  
}; 


option.into_dashang = function () {

  //注意，必须用previewImage来显示我们的赞助二维码图片，才能在真机上长按时出现“识别二维码”的选项，如果用 image标签来显示我们的 赞助二维码图片，长按它是没有反应的。（ps，直接用赞助二维码图片则可，不需要用base64格式
  var that = this;
  if (that.data.ds != "" & that.data.ds != null){
  wx.previewImage({
    current: that.data.ds, // 当前显示图片的http链接
    urls: [that.data.ds] // 需要预览的图片http链接列表
  })
  } 
  else {
    wx.showToast({
      title: 'Sorry, the team has not yet opened the reward code.',
      icon: 'none',
      duration: 2000
    }) }
};

option.viewwz = function () {
  var that = this;
  wx.navigateTo({
    url: '../../article/article?rid=' + that.data.rid
  })
}

option.todiantai = function () {
  var that = this;
  wx.navigateTo({
    url: '/pages/radio/mydiantai/mydiantai?view_avid=' + that.data.avid
  }) 
}

  Page(option);
  