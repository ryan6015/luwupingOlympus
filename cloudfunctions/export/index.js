// 云函数入口文件
const cloud = require('wx-server-sdk')
//操作excel用的类库
const xlsx = require('node-xlsx');
cloud.init()
const db = cloud.database()
const MAX_LIMIT = 1000

// 云函数入口函数
exports.main = async (event, context) => {
  const infoDB = db.collection('info')
  // 先取出集合记录总数
  const countResult = await infoDB.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 1000)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = infoDB.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  const datalist = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })

  let fileName = 'OlympusInfo.xlsx'
  let fileData = []
  let header = ['医院名称', '科室', '品牌名称', '型号', '腔镜数量', '购买年份', '科室床位数(张)', '科室收入(万)', '科室总手术量', '腔镜手术占比(%)', '提交人公司', '提交人姓名', '地区']
  fileData.push(header)
  let dataResult = datalist.data || datalist.result.data
  dataResult.forEach(item => {
    let arr = []
    arr.push(item.hospitalName)
    arr.push(item.department)
    arr.push(item.brand)
    if (item.isOlympus == 1) {
      arr.push(item.model)
    } else {
      arr.push(item.olympusModel.join(','))
    }
    arr.push(item.laparNum)
    arr.push(item.year)
    arr.push(item.bedNum)
    arr.push(item.income)
    arr.push(item.operationNum)
    arr.push(item.percent)
    arr.push(item.company)
    arr.push(item.submitter)
    arr.push(item.area)
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
  return fileID
}