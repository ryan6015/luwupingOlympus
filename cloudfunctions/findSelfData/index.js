// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const DB = cloud.database()
const command = DB.command
const infoTable = DB.collection('info')

function createQuery(queryText) {
  let queryArr = []
  let list = ['hospitalName', 'department', 'brand', 'model', 'year', 'company', 'submitter', 'area', 'note']
  // 字符串模糊查询
  list.forEach(item => {
    let queryCondition = {}
    queryCondition[item] = {
      $regex: '.*' + queryText + '.*',
      $options: 'i'
    }
    queryArr.push(queryCondition)
  })
  // 数组
  queryArr.push({
    olympusModel: command.elemMatch({
      $regex: '.*' + queryText + '.*',
      $options: 'i'
    })
  })
  return queryArr
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { pageIndex, pageSize } = event
  let selfData = infoTable.where({
    userInfo: {
      openId: command.eq(OPENID)
    }
  })
  // 总记录数
  let { total } = await selfData.count()
  const totalPage = Math.ceil(total / pageSize)
  // 是否还有下一页
  if (pageIndex >= totalPage) {
    hasMore = false
  } else {
    hasMore = true
  }
  // data
  let { data } = await selfData.orderBy('createtime', 'desc').skip((pageIndex - 1) * pageSize).limit(pageSize).get()

  return {
    totalRecord: total,
    totalPage,
    pageIndex,
    pageSize,
    hasMore,
    pageData: data
  }
}
