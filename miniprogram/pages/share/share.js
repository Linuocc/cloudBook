const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    expenses:[],
    payments:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })
    wx.showLoading({
      title: '加载中',
    })
    db.collection('expenses').where({
      projectId:this.data.id,
      status:1
    }).field({
      _openid:false
    }).get().then(res=>{
      wx.hideLoading({
        complete: (res) => {},
      })
      this.setData({
        expenses:res.data
      })
    })
    db.collection('payments').where({
      projectId:this.data.id,
      status:1
    }).field({
      _openid:false
    }).get().then(res=>{
      wx.hideLoading({
        complete: (res) => {},
      })
      this.setData({
        payments:res.data
      })
    })
  },

  
})