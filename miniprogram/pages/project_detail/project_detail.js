const db = wx.cloud.database();
const $ = db.command.aggregate
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize:10,
    expenses:[],
    expensesIsEnd:false,
    expensesCurrentPage:1,
    payments:[],
    paymentsIsEnd:false,
    paymentsCurrentPage:1,
    totalPrice:0,
    totalPayment:0
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
      title: "加载中",
      mask:true
    })
    this.setData({
      expenses:[],
      expensesIsEnd:false,
      expensesCurrentPage:1,
      payments:[],
      paymentsIsEnd:false,
      paymentsCurrentPage:1,
    })
    Promise.all([
      new Promise((resolve,reject)=>{
        db.collection("projectList").doc(this.data.id).get().then(res=>{
          resolve(res)
        })
      }),
      this.getPageData(this.data.expensesCurrentPage,this.data.pageSize,"expenses"),
      this.getPageData(this.data.expensesCurrentPage,this.data.pageSize,"payments"),
      db.collection('expenses').aggregate().match({
        projectId:this.data.id,
        status:1
      }).group({
        _id:null,
        totalPrice: $.sum($.sum(['$totalPrices', '$otherMoney']))
      }).end(),
      db.collection('payments').aggregate().match({
        projectId:this.data.id,
        status:1
      }).group({
        _id:null,
        totalPayment: $.sum('$paymentMoney')
      }).end()
    ]).then(res=>{
      wx.hideLoading()
      this.setData({
        projectData:res[0].data,
        totalPrice:res[3].list.length!==0?res[3].list[0].totalPrice:0,
        totalPayment:res[4].list.length!==0?res[4].list[0].totalPayment:0,
        
      })
      this.setData({
        notPayment:(this.data.totalPrice-this.data.totalPayment).toFixed(2)
      })
      
    }).catch(err=>{
      console.log(err)
    })
  },
  //打开添加费用页面
  addMoney(){
    wx.navigateTo({
      url: `/pages/add_money/add_money?id=${this.data.id}`,
    })
  },
  //打开添加结算页面
  addPayments(){
    wx.navigateTo({
      url: `/pages/add_payments/add_payments?id=${this.data.id}`,
    })
  },

  // 分页
  getPageData(currentPage,pageSize=10,name){
    return new Promise((resolve,reject)=>{
      db.collection(name).orderBy('createTime', 'desc').field({
        _openid:false
      }).where({
        projectId:this.data.id,
        status:1
      }).skip(pageSize*(currentPage-1)).limit(pageSize).get().then(res=>{
        let arr = [];
        arr = this.data[name]

        if(res.data.length<pageSize){
          this.setData({
            [name+'IsEnd']:true
          })
        }else{
          this.setData({
            [name+'CurrentPage']:this.data[name+'CurrentPage']+1
          })
        }

        arr.push(...res.data)
        this.setData({
          [name]:arr,
        })
        
        resolve();
      })
    })
    
  },
  onReachBottom(){
    if(!this.data.expensesIsEnd){
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      this.getPageData(this.data.expensesCurrentPage,this.data.pageSize,"expenses").then(()=>{
        wx.hideLoading({
          complete: (res) => {},
        })
      })
    }
    if(!this.data.paymentsIsEnd){
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      this.getPageData(this.data.expensesCurrentPage,this.data.pageSize,"payments").then(()=>{
        wx.hideLoading({
          complete: (res) => {},
        })
      })
    }
  },
  //删除项目
  deleteProject(){
    wx.showModal({
      title:'提示',
      content:'确认删除此项目？',
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
              name:'projectList',
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
  //费用详情
  moneyDetail(option){
    // 获取id
    let id = option.currentTarget.dataset.id;
    wx.navigateTo({
      url:`/pages/money_detail/money_detail?id=${id}`
    })
  },
  //结算详情
  paymentDetail(option){
    // 获取id
    let id = option.currentTarget.dataset.id;
    wx.navigateTo({
      url:`/pages/payments_detail/payments_detail?id=${id}`
    })
  },
  onShareAppMessage(){
    return {
      title:`《${this.data.projectData.name}》的账单`,
      path:`/pages/share/share?id=${this.data.id}`,
      imageUrl:'/images/share.png'
    }
  },
  // onShareTimeline(){
  //   return {
  //     title:`《${this.data.projectData.name}》的账单`,
  //     query:`id=${this.data.id}`,
  //     imageUrl:'/images/share.png'
  //   }
  // }
  
})