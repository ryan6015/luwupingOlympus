// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    const db = cloud.database()
    const INFO = db.collection('info')
    INFO.add({
      data: event
    }).then(res => {
      resolve('success')
    }).catch(() => {
      reject()
    })
  })
}