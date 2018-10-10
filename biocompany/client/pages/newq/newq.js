var config = require('../../config');

Page({
  data: {
    pictures: [], //存放所有upload了的图片,即一串URL地址
    title: '',  //存放问题标题
    detail: ''  //存放问题详情
  },

  onLoad: function () {

  },


  onShow: function ()  //似乎是每一次进入(即生成)这个页面的时候都会触发， 
  {


  },


  //点击发布问题
  //将edit完毕的数据"tile,detail以及一个图片URL数组，上传到数据库，以新增一条问题记录
  formSubmit: function (e) {

    // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.setData({ title: e.detail.value.title.trim() });
    this.setData({ detail: e.detail.value.detail.trim() });


    if (this.data.title == "" || this.data.detail == "") {
      wx.showToast({
        title: 'Filled in unfinished, cannot be submitted',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var that = this;

    wx.showLoading({
      title: 'Publishing topic',
      mask: true
    });

    getApp().request({

      url: '/question/postquestion',
      method: 'post',
      data: {
        title: that.data.title,
        detail: that.data.detail,
        pictures: that.data.pictures
      },
      success: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: 'Successfully published',
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

    });

  },


  ///////////////////////////////保存edit数据  
  /*
  发帖子/发回答 部分 出现的 bug：输入文本以后直接点提交会触发不了那个失焦事件，导致发送出去的帖子是空的。  所以必须输入以后，点一下文本框以外的地方或者手机端点一下完成，再点提交，才能正常发布。
  经过测试检查，发现原因在于 textarea 的失去焦点事件（bindblur）响应比按钮点击事件响应慢。
  参考了问题:https://developers.weixin.qq.com/blogdetail?action=get_post_info&docid=00022076e08c90d00c96b3e0451c00&highline=blur%E8%A7%A6%E5%8F%91
  （而这个问题也只在于textarea，所以在me页面用的都是input组件的情况下，不会出现这个bug）
  按照楼里的问答，应该参考textarea的用户手册 如下
  tip :  textarea  的  blur  事件会晚于页面上的  tap  事件，如果需要在  button  的点击事件获取  textarea ，可以使用  form  的  bindsubmit 。
  所以相应改写了页面的wxml与js。（不再采用me.js的方法
  */
  /*
  changetitle: function (e) {
    //console.log("i am here");
    //console.log(e);
    this.setData({ title: e.detail.value.trim() }); 
  },
  changedetail: function (e) {
    //console.log("i am here now");
    //console.log(e);
    this.setData({ detail: e.detail.value.trim() }); 
  },
  */
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
              newpictures = that.data.pictures;
              newpictures.push(res.data);
              that.setData({ pictures: newpictures });
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