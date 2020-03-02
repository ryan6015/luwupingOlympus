// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const infoDB = cloud.database().collection('info')

// 云函数入口函数
exports.main = async (event, context) => {
  const { _id, note } = event
  const {stats} = await infoDB.where({
    _id
  }).update({
    data: {
      note
    }
  })

  return stats.updated
}