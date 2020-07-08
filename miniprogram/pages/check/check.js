import Toast from '@vant/weapp/toast/toast';
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    password:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '身份验证中...',
      mask:true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.cloud.callFunction({
      name:"login"
    }).then(res=>{
      wx.hideLoading();
      //判断是否验证成功
      if(res.result){
        Toast({
          type: 'success',
          message: '验证成功',
          onClose: () => {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          },
        });
      }else{
        Toast.fail('验证失败');
      }
      
    }).catch(err=>{
      Toast.fail('请重启小程序');
    })
  },
  inputPassword(option){
    this.setData({
      password:option.detail.value
    })
  },
  verify(){
    if(this.data.password.length==6){
      db.collection('config').where({
        key:'password',
        value:this.data.password
      }).count().then(res=>{
        if(res.total>0){
          Toast({
            type: 'success',
            message: '验证成功',
            onClose: () => {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            },
          });
        }else{
          Toast.fail('密码错误');
        }
      })
    }else{
      Toast.fail('请正确输入6位密码');
    }
  }
})