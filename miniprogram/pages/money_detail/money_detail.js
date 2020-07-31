const db = wx.cloud.database();
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })
    

  },
  onShow(){
    wx.showLoading({
      title: '加载中',
    })
    db.collection('expenses').where({
      _id:this.data.id,
      status:1
    }).field({
      _openid:false
    }).get().then(res=>{
      this.setData({
        data:res.data[0]
      })
      wx.hideLoading({
        complete: (res) => {},
      })

    })
  },
  edit(){
    wx.navigateTo({
      url: `/pages/edit_money/edit_money?id=${this.data.id}`,
    })
  },
  //删除费用
  delete(){
    wx.showModal({
      title:'提示',
      content:'确认删除此费用？',
      confirmColor: '#39B54A',
      confirmText:'删除',
      success:(res)=>{
        if (res.confirm) {
          wx.showLoading({
            title:"正在删除",
            mask:true
          })
          wx.cloud.callFunction({
            name:'delete',
            data:{
              name:'expenses',
              id:this.data.id
            }
          }).then(res=>{
            wx.hideLoading({
              complete: (res) => {},
            })
            if(res.result.stats.updated>0){
              Toast({
                type: 'success',
                message: '删除成功',
                onClose: () => {
                  wx.navigateBack({
                    delta: 1
                  })
                },
              });
            }
          }).catch(err=>{
            wx.hideLoading({
              complete: (res) => {},
            })
            console.log(err)
          })
        }
      }
    })
  },
})