// 云函数入口文件
const cloud = require('wx-server-sdk')
//操作excel用的类库
const xlsx = require('node-xlsx');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const hospitals = db.collection('hospitals')
  const datalist = hospitals.get()

  let fileName = '导出结果'
  let fileData = []
  let header = ['gid', '医院名称']
  fileData.push(header)
  datalist.forEach(item => {
    let arr = []
    arr.push(item._id)
    arr.push(item.hospitalName)
    fileData.push(arr)
  })

  let buffer = await xlsx.build([{
    name: "Sheet1",
    data: fileData
  }])
  //4，把excel文件保存到云存储里
  let {fileID} = await cloud.uploadFile({
    cloudPath: fileName,
    fileContent: buffer //excel二进制文件
  })

  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  return buffer.toString('utf8')
}