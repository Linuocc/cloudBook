const db = wx.cloud.database();
const app = getApp()

Page({
  data: {
    unfinishList:[],
    finishList:[],
    unfinishCurrentPage:1,
    finishCurrentPage:1,
    pageSize:10,
    unfinishIsEnd:false,
    finishIsEnd:false,
    CustomBar: app.globalData.CustomBar,
  },

  onShow: function() {
    this.setData({
      unfinishList:[],
      finishList:[],
      unfinishCurrentPage:1,
      finishCurrentPage:1,
      unfinishIsEnd:false,
      finishIsEnd:false
    })
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    Promise.all([
      this.getPageData(this.data.unfinishCurrentPage,this.data.pageSize,false),
      this.getPageData(this.data.finishCurrentPage,this.data.pageSize),
    ]).then(()=>{
      wx.hideLoading()
    })
    
  },

  getPageData(currentPage,pageSize=10,finish=true){
    return new Promise((resolve,reject)=>{
      db.collection("projectList").orderBy('createTimestamp', 'desc').field({
        _id:true,
        name:true,
        location:true,
        finish:true
      }).where({
        finish,
        status:1
      }).skip(pageSize*(currentPage-1)).limit(pageSize).get().then(res=>{
        let arr = [];
        if(finish){
          arr = this.data.finishList
        }else{
          arr = this.data.unfinishList
        }

        
        if(res.data.length<pageSize){
          this.setData({
            [finish?'finishIsEnd':'unfinishIsEnd']:true
          })
        }else{
          this.setData({
            [finish?'finishCurrentPage':'unfinishCurrentPage']:this.data[finish?'finishCurrentPage':'unfinishCurrentPage']+1
          })
        }

        arr.push(...res.data)
        this.setData({
          [finish?'finishList':'unfinishList']:arr,
        })
        
        resolve();
      })
    })
    
  },



  //打开添加项目页面
  addProject(){
    wx.navigateTo({
      url: '/pages/add_project/add_project',
    })
  },
  //打开项目详情页面
  detail(option){
    wx.navigateTo({
      url: `/pages/project_detail/project_detail?id=${option.currentTarget.dataset.id}`,
    })
  },
  onReachBottom(){
    if(!this.data.unfinishIsEnd){
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      this.getPageData(this.data.unfinishCurrentPage,this.data.pageSize,false).then(()=>{
        wx.hideLoading({
          complete: (res) => {},
        })
      })
    }
    if(!this.data.finishIsEnd){
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      this.getPageData(this.data.finishCurrentPage,this.data.pageSize).then(()=>{
        wx.hideLoading({
          complete: (res) => {},
        })
      })
    }
  },
  onPullDownRefresh(){
    this.setData({
      unfinishList:[],
      finishList:[],
      unfinishCurrentPage:1,
      finishCurrentPage:1,
      unfinishIsEnd:false,
      finishIsEnd:false
    })
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    Promise.all([
      this.getPageData(this.data.unfinishCurrentPage,this.data.pageSize,false),
      this.getPageData(this.data.finishCurrentPage,this.data.pageSize),
    ]).then(()=>{
      wx.hideLoading()
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
    })
  }
})
