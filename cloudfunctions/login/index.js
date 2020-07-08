const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openid = wxContext.OPENID;

  return (await db.collection('users').where({
    openid
  }).get()).data.length!==0
}

