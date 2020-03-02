// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const adminDB = cloud.database().collection('adminusers')
// 云函数入口函数
exports.main = async (event, context) => {
  let { city, nickName, province } = event
  let list = await adminDB.where({
    city,
    nickName,
    province
  }).get()
  if (null != list && list.data && list.data.length > 0) {
    return 'yes'
  }
  return 'no'
}
