// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    const db = cloud.database()
    const hospitals = db.collection('hospitals')
    hospitals.add({
      data: {
        hospitalName: event.hospitalName
      }
    }).then(res => {
      resolve('success')
    }).catch(() => {
      reject()
    })
  })
}