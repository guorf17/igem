////
var shipURL = '';
var wzURL = '';
////


var config = {
  Bucket: 'todo-1256714442',//replace with yours
  Region: 'ap-guangzhou',//replace with yours
  SecretId: 'AKIDzpT0NYDO7e4JMIvzZwwFRXUFoBMRiVAs',//replace with yours
  SecretKey: 'jIk29NdpEbszvfDal7MapsqdEdpsmsR0'//replace with yours

}

var configold = require('../../../config');


//index.js
var COS = require('../../../lib/cos-wx-sdk-v5')


var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数

    // 方法一（推荐）服务器提供计算签名的接口
    /*
    wx.request({
        url: 'SIGN_SERVER_URL',
        data: {
            Method: params.Method,
            Key: params.Key
        },
        dataType: 'text',
        success: function (result) {
            callback(result.data);
        }
    });
    */

    // 方法二（适用于前端调试）
    var authorization = COS.getAuthorization({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      Method: params.Method,
      Key: params.Key
    });
    callback(authorization);
  }
});

var requestCallback = function (err, data) {
 
  console.log(err || data);
  if (err && err.error) {
    wx.showModal({ title: '返回错误', content: '请求失败：' + err.error.Message + '；状态码：' + err.statusCode, showCancel: false });
  } else if (err) {
    wx.showModal({ title: '请求出错', content: '请求出错：' + err + '；状态码：' + err.statusCode, showCancel: false });
  } else {
    //console.log(data); 只返回了状态码
    wx.hideLoading();
    wx.showToast({ title: '请求成功', icon: 'success', duration: 3000 });
    shipURL = 'https://todo-1256714442.cos.ap-guangzhou.myqcloud.com/' + Key;//配置工程的时候需要自己手动改这里

    that.setData({ hidepost: false });

  }
};



var option = {
  data: {
    list: [],
  },
};
var Key; var that;
option.videoUpload = function () {
  that = this;
  this.setData({ hidewz: true });

  // 选择文件
  wx.chooseVideo({
    //count: 1, // 默认9
    //sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有     
    sourceType: ['album'],
    success: function (res) {

      wx.showLoading({
        title: 'Uploading video',
        mask: true
      });
      //console.log(res)
      //var filePath = res.tempFilePaths[0]
      var filePath = res.tempFilePath
      Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
      //console.log(Key)//https://todo-1256714442.cos.ap-guangzhou.myqcloud.com/ +Key 即本文件存放在cos的url地址。 （仅对于桶名和地区为以上的。）

      cos.postObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: Key,
        FilePath: filePath,
        onProgress: function (info) {
          console.log(JSON.stringify(info));
        },

      }, requestCallback);

    }
  })
};



option.onLoad = function (options) {

  this.setData({ idea_id: options.idea_id });
};

option.data = {
  cover: '/images/moren.png',
  hidesp: false,
  hidewz: false,
  editlist: [],
  hidepost: true

}

//获取应用实例
Page(option);

option.inputover = function (e) {
  var index = e.currentTarget.dataset.index;
  var content = e.detail.value.trim();
  //content = content.replace('\n', '<br/>');  //如此写只能替换全文中的第一个\n，所以改为如下
  content = content.replace(/\n/g, "<br/><span style='color: white;'>0</span>");  //  /g是全文匹配
  //content = content.replace(/ /g, "<span style='color: white;'>0</span>");   //替换空格
 content = "<span style='color: white;'>0</span><span style='color: white;'>0</span>" + content ///第一段强制加两个空格
  var newlist = this.data.editlist;
  newlist[index].content = content;
  this.setData({ editlist: newlist });


}


////发布我的日志
option.formSubmit = function (e) {

  ///如果选择的不是发表文章，就跳过，令wzURL继续为空。否则，先整理编辑的文章内容，放到wzURL中
  //[其实需要从渲染层整理到js的，只有textarea的输入内容 (在textarea绑定的函数里做)，其后，直接将editlist内容放置到wzURL则可]

  if (this.data.hidesp == true) {

    wzURL = this.data.editlist;
    wzURL = JSON.stringify(wzURL);    //必须要在此处将wzURL数组转化为相应的json字符串，否则在后台插入的时候，由于rURL属性的类型是varchar，所以尝试插入的时候，会报错：Column count doesn't match value count at row 1，意思是你所存储的数据与数据库表的字段类型定义不相匹配.
    //console.log(wzURL)    
    //后面要用的时候，再把rURL取出转换为json对象则可。
  }


  ///////

  this.setData({ title: e.detail.value.title.trim() });


  if (this.data.title == "" || (wzURL == "" && shipURL=="")) {
    wx.showToast({
      title: 'Filled in unfinished, cannot be submitted',
      icon: 'none',
      duration: 2000
    })
    return;
  }


  wx.showLoading({
    title: 'Publishing article',
    mask: true
  });

  var that = this;
  getApp().request({

    url: '/radio/fawen',
    method: 'post',
    data: {
      wzURL: wzURL,
      shipURL: shipURL,
      avid: getApp().globalData.userInfo.avid,
      idea_id: that.data.idea_id,
      title: that.data.title,
      cover: that.data.cover
    },
    success: function (res) {
      wx.hideLoading();
      wx.showToast({
        title: 'Successfully published',
        icon: 'success',
        duration: 2500,
        success: function () {
          setTimeout(function () {
            //最后，记得返回刚才的页面
            wx.navigateBack({
              delta: 1
            })//要延时执行的代码  
          }, 1000)

        }

      })

    }

  });


};


//上传图片
option.UploadPicture = function (e) {

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
        url: configold.host + '/question/UploadPicture',
        filePath: res.tempFilePaths[0],
        name: 'avatar', //若改掉此，则后台的post UploadPicture函数也要进行相应的修改，否则在该函数内会提取不到图片，从而上传失败
        success: function (res) {
          if (res.statusCode == 200) {
            wx.hideLoading();
            //服务器返回上传图片的URL地址，将其add到页面的内部状态变量pictures中

            that.setData({ cover: res.data });
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
};


option.fileUpload = function () {
  this.setData({ hidesp: true });
  // 选择文件

};

option.overedit = function () {
  ///增设这一个点击事件，是为了图文编辑的最后一个textarea的内容能被存下来
  this.setData({ hidepost: false });


};

option.inserttext = function () {

  var newlist = this.data.editlist;
  newlist.push({ _type: "text", content: "" }); ///插入文本编辑框
  this.setData({ editlist: newlist });

};


option.insertpicture = function () {
  var that = this;
  var content = '';

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
        url: configold.host + '/question/UploadPicture',
        filePath: res.tempFilePaths[0],
        name: 'avatar', //若改掉此，则后台的post UploadPicture函数也要进行相应的修改，否则在该函数内会提取不到图片，从而上传失败
        success: function (res) {
          if (res.statusCode == 200) {
            wx.hideLoading();
            //服务器返回上传图片的URL地址，将其add到页面的内部状态变量pictures中

            content = res.data;
            var newlist = that.data.editlist;
            newlist.push({ _type: "img", content: content });  ///插入图片
            that.setData({ editlist: newlist });
          }
          else {
            wx.showToast({
              title: 'The image is too large, the upload failed, please re - fill the question',
              icon: 'none',
              duration: 2000
            })
          }
        }
      });

    }
  });



};


option.del = function (event) {   //撤销以上输入
  var index = event.currentTarget.dataset.index;
  var newlist = this.data.editlist;
  newlist.splice(index, 1);
  this.setData({ editlist: newlist });

};