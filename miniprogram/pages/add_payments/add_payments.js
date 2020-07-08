const db = wx.cloud.database();
import Toast from '@vant/weapp/toast/toast';
import getNowTime from "../../utile/getNowTime"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paymentMoney:0,
    description:'',
    savaBtnIsDisabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })
  },
  //输入结算金额
  inputMoney(options){
    this.setData({
      paymentMoney:options.detail.value*1
    })
  },
  //输入备注
  inputDescription(options){
    this.setData({
      description:options.detail.value
    })
  },
  //保存结算
  save(){
    const {description,paymentMoney} = this.data;
    if(paymentMoney!==0){
      this.setData({
        savaBtnIsDisabled:true
      })
      wx.showLoading({
        title: '正在保存',
        mask:true
      })
      db.collection('payments').add({
        data:{
          projectId:this.data.id,
          description,
          paymentMoney,
          createTime: getNowTime(),
          createTimestamp:new Date().getTime(),
          status:1
        }
      }).then(res=>{
        wx.hideLoading()
        if(res._id){
          Toast({
            type: 'success',
            message: '保存成功',
            onClose: () => {
              wx.navigateBack({
                delta: 1
              })
            },
          });
        }else{
          Toast.fail('保存失败，请重试');
          this.setData({
            savaBtnIsDisabled:false
          })
        }
      }).catch(err=>{
        wx.hideLoading()
        Toast.fail('保存失败，请重试');
        this.setData({
          savaBtnIsDisabled:false
        })
      })
    }else{
      Toast.fail('结算金额不能为零');
    }
  }

  
})