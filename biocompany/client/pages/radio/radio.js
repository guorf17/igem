

var start_clientX;
var end_clientX;
const app = getApp()
const util = require("../../utils/utils.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    feed: [],

    hasload: false,  //是否已经加载完初始数据
    reqid: -1, //目前要获取的问题概述的id
    avatar: "/images/icons/weidenglu.png",
    windowWidth: wx.getSystemInfoSync().windowWidth,
    hideview: true,
    hiddenModal: true
  },
  
  // 滑动开始  
  touchstart: function (e) {
    start_clientX = e.changedTouches[0].clientX
  },
  // 滑动结束  
  touchend: function (e) {
    end_clientX = e.changedTouches[0].clientX;
    if (end_clientX - start_clientX > 120) {
      this.setData({
        display: "block",
        translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
      })
    } else if (start_clientX - end_clientX > 0) {
      this.setData({
        display: "none",
        translate: ''
      })
    }
  },
  nextLoad: function () {


    if (this.data.reqid < 1)   //判断已经加载到底部了
    {
      wx.showToast({
        title: 'Already loaded to the bottom',
        icon: 'success',
        duration: 2000
      })
      return;
    }

    ///////
    wx.showLoading({
      title: 'Loading',
      mask: true
    });

    var that = this;
    getApp().request({

      url: '/radio',
      method: 'post',
      data: {
        reqid: that.data.reqid
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          reqid: res.data.id,
          feed: that.data.feed.concat(res.data.data),  ///注意，这里用的是拼接，则feed里存放的 应该总是"所有已经加载出来过的数据{}"
          feed_length: that.data.feed_length + res.data.data.length
        });

      }

    });
    /// 
  },

  /*
  // 出现 
  showview: function () {
    this.setData({ hideview: false })
    this.setData({
      display: "block",
      translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
    })
  },
  // 遮拦  
  hideview: function () {
    //console.log(this.data.hideview);
    this.setData({ hideview: true })
    //console.log(this.data.hideview);
    this.setData({
      display: "none",
      translate: '',
    })
  },*/

  bindQueTap: function (event) {
    //console.log(event);
    //console.log(event.currentTarget.dataset.qid);
    var rid = event.currentTarget.dataset.rid;
    wx.navigateTo({
      url: 'wzxiangqing/wzxiangqing?rid=' + rid  //注意勿漏等于号，否则在跳转后页面的解析接受会有问题
    })
  },

  upper: function () { //联下面的批注，注意这个upper动作是怎么处理的 —— —— “只要进行了一次上划（到触发动作），就会执行refresh函数来使得页面又恢复只有一开始八个问题（即跳转到最上面）”
    //其实这个事件处理函数不要了也没关系，这个QA页面还是可以按照想要的正常运作，只不过向下拉了比较长以后，也需要慢慢向上拉很久才能回到顶部。
    wx.showNavigationBarLoading()
    this.refresh();
    console.log("upper");
    setTimeout(function () { wx.hideNavigationBarLoading(); wx.stopPullDownRefresh(); }, 2000);
  },
  lower: function (e) {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function () { wx.hideNavigationBarLoading(); that.nextLoad(); }, 1000);
    console.log("lower")
  },
  getData2: function () {
    var that = this;
    getApp().request({

      url: '/radio',
      method: 'post',
      data: {
        reqid: that.data.reqid
      },
      success: function (res) {

        that.setData({ reqid: res.data.id, feed: res.data.data });
        //console.log(res)
      }

    });

  },

  getData: function () {
    //在这里先request获取到question表格的长度，然后放在页面的状态变量reqid里。
    //然后再在此request的success里调用下面的getData2获取最新的8条问题概述
    ///【待检查】 //test ok

    var that = this;

    wx.showLoading({
      title: 'Loading',
      mask: true
    });

    getApp().request({

      url: '/radio',
      method: 'get',
      success: function (res) {
        wx.hideLoading();
        that.setData({ reqid: res.data.reqid });
        //console.log(that.data.reqid)
        that.getData2();

      }

    });
    //this.getData2();//直接使用getData2()会显示 getData2 is not defined     
  },
  refresh: function () {
    this.getData();
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
 
    //this.getData();

    //新增，授权后需要再调用一次getuserinfo以获取用户信息
    if (getApp().globalData.userInfo.name == '') {
      getApp().checkLogin(function () {

      });  //所以登录改为放在此处
    }
    /////

     
     
      this.setData({ avid: getApp().globalData.userInfo.avid });
     
   
    var that = this;
    getApp().request({

      url: '/login/getxinxi',
      method: 'post',
      data: {
        avid: that.data.avid
      },
      success: function (res) {

        that.setData({
          avatar: res.data.touxiang,
          user_name: res.data.ming
        });

      }

    });
    ////
 
    if (getApp().globalData.userInfo.first_login == true) //第一次登录 显示先导页
    {
      this.setData({
        hiddenModal: false
      })
      getApp().globalData.userInfo.first_login = false; //令先导页只显示一次
    }
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onLoad: function () {

    console.info('loading index...');
    /*
        getApp().checkLogin(function () {
    
        });  //登录*/


    this.getData();

/// 一开始隐藏侧滑栏
    this.setData({
      display: "none"})



  },
  listenerConfirm:function(){
    this.setData({
      hiddenModal: true
    })
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
    return {
      title: "High-cold technology, developed by you~",
      imageUrl:"/images/cat1.jpg"
    }
  },
  into_content: function () {
    wx.navigateTo({
      url: "/pages/listen/content/content",
    })
  },
  suspend_collection: function () {
    wx.navigateTo({
      url: '/pages/listen/Collect/Collect',
    })
  },
  suspend_me: function () {
    wx.navigateTo({
      url: '/pages/listen/Me/Me',
    })
  },
  suspend_notice: function () {
    wx.navigateTo({
      url: '/pages/listen/notice/notice',
    })
  },


  fw: function () {
    wx.navigateTo({
      url: '/pages/radio/fawen/fawen',
    })
  },
  logout: function () {

    getApp().globalData.userInfo.avid = '';
    this.setData({ avid: getApp().globalData.userInfo.avid });
    this.setData({ avatar: "/images/icons/weidenglu.png" });
  },

  //进行问题检索 √
  search: function (e) {
    var that = this;
    var query = e.detail.value.trim();///搜索关键字
    if (query == "") { this.getData(); } //如果关键字为空，则刷新为初始的QA页面（按时间显示所有问题，否则才发出search请求
    else {
      getApp().request({

        url: '/radio/search',
        method: 'post',
        data: {
          query: query
        },
        success: function (res) {
          if (res.statusCode == 200) { //成功找到结果//一次返回所以匹配结果，所以直接置reqid为-1
            that.setData({ reqid: -1, feed: res.data, feed_length: res.data.length });
          }
          else { that.setData({ feed: [] }); } //未找到结果，则置空feed
        }

      });
    }

  },

  tomydiantai: function(){
     
    wx.navigateTo({
      url: '/pages/radio/mydiantai/mydiantai?view_avid=' + getApp().globalData.userInfo.avid   
    }) 
  }



})


