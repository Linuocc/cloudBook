import Toast from '@vant/weapp/toast/toast';
const db = wx.cloud.database();
import getNowTime from "../../utile/getNowTime"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:"",
    location:{},
    isDisabled:false,
    savaBtnIsDisabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 输入项目名称
  inputName(option){
    this.setData({
      name:option.detail.value
    })
  },
  //选择项目位置
  chooseAddress(){
    this.setData({
      isDisabled:true
    })
    wx.getSetting({
      success:(res)=>{
        if(res.authSetting["scope.userLocation"]){
          wx.chooseLocation({
            success:(res)=>{
              this.setData({
                location:res
              })
            },
            complete:()=>{
              this.setData({
                isDisabled:false
              })
            }
          })
        }else{
          wx.authorize({
            scope: 'scope.userLocation',
            success () {
              wx.chooseLocation({
                success:(res)=>{
                  this.setData({
                    location:res
                  })
                },
                complete:()=>{
                  this.setData({
                    isDisabled:false
                  })
                }
              })
            }
          })
        }
      },
    })
  },
  //保存项目
  saveProject(){
    this.setData({
      savaBtnIsDisabled:true
    })
    let data = this.data
    if(data.name!==''&&Object.keys(data.location).length!==0){
      wx.showLoading({
        title: '正在保存',
      })
      db.collection("projectList").add({
        data:{
          name:data.name,
          location:data.location,
          createTime: getNowTime(),
          createTimestamp:new Date().getTime(),
          finish:false,
          status:1//1为正常
        }
        
      }).then(res=>{
        wx.hideLoading()
        if(res._id){
          Toast({
            type: 'success',
            message: '保存成功',
            onClose: () => {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            },
          });
        }else{
          Toast.fail('保存失败，请重试1');
          this.setData({
            savaBtnIsDisabled:false
          })
        }
      }).catch(err=>{
        wx.hideLoading()
        Toast.fail('保存失败，请重试2');
        this.setData({
          savaBtnIsDisabled:false
        })
      })
    }else{
      Toast.fail('请填写完整');
      this.setData({
        savaBtnIsDisabled:false
      })
    }
  }
})