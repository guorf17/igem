module.exports = {
  port: 5757,
  //过期时间，秒
  expireTime: 24 * 3600,
  appid: 'wxdc31a3d71fc005e9',//your app id
  secret: '4cd262c2dfc2276b223e9b90799f55da', // 填入：微信公众平台的开发设置，生成获取到的Appsecret(小程序密钥)
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',//phpMyadmin登录名，默认是root
    db: 'todo', //数据库名称
    pass: 'wxc022d5c77609d44d',//phpMyadmin登录名密码，默认是your app id
    char: 'utf8mb4'
  },
  //文件云存储  
  cos: {
    region: 'ap-guangzhou',  //存储桶所属地域
    fileBucket: 'todo'  //存储桶名称
  }
};