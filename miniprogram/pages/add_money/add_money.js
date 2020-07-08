const db = wx.cloud.database();
import Toast from '@vant/weapp/toast/toast';
import getNowTime from "../../utile/getNowTime"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    length:0,//总长度
    inputLength:0,//输入长度
    width:0,//宽度
    price:0,//单价
    totalPrices:0,//总价格
    description:'',//描述
    otherMoney:0,//其他费用
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
  // 输入长度
  inputLength(options){
    this.setData({
      inputLength:options.detail.value?options.detail.value:0
    })
  },
  //增加长度
  addLength(){
    this.setData({
      length:(this.data.length*1+this.data.inputLength*1).toFixed(2)
    })
  },
  //输入宽度
  inputWidth(options){
    this.setData({
      width:options.detail.value?options.detail.value:0
    })
  },
  //输入单价
  inputPrice(options){
    this.setData({
      price:options.detail.value?options.detail.value:0
    })
  },
  //计算总价格
  computed(){
    let totalPrices = (this.data.length*this.data.width*this.data.price).toFixed(2)*1
    this.setData({
      totalPrices
    })
  },
  //输入费用描述
  inputDescription(options){
    this.setData({
      description:options.detail.value
    })
  },
  //输入其他费用
  inputOtherMoney(options){
    this.setData({
      otherMoney:options.detail.value?options.detail.value*1:0
    })
  },
  //清空
  reset(){
    this.setData({
      length:0,
    })
  },
  //保存
  save(){
    const {description,length,width,price,totalPrices,otherMoney} = this.data;
    if(description!==''&&(totalPrices!==0||otherMoney!==0)){
      this.setData({
        savaBtnIsDisabled:true
      })
      wx.showLoading({
        title: '正在保存',
        mask:true
      })
      db.collection('expenses').add({
        data:{
          projectId:this.data.id,
          description,
          length,
          width,
          price,
          totalPrices,
          otherMoney,
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
      Toast.fail('请完整填写');
    }
    


  }
})