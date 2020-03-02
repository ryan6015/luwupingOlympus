// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')
//操作excel用的类库
const xlsx = require('node-xlsx');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const infoDB = cloud.database().collection('info')
const MAX_LIMIT = 1000
const fileName = 'OlympusInfo.xlsx'
const header = ['地区', '医院名称', '科室', '品牌名称', '型号', '腔镜数量', '购买年份', '科室床位数(张)', '科室收入(万)', '每月平均手术量', '腔镜手术占比(%)', '提交人公司', '提交人姓名', '备注']
const appid = 'wx83e737f152521028'
const secret = 'b85fc58bdfe254c645f6b5fda337fedb' 


// 云函数入口函数
exports.main = async (event, context) => {
  // 先取出集合记录总数
  const { total } = await infoDB.count()
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = infoDB.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let datalist = { data: []}
  if (tasks.length > 0) {
    // 等待所有数据取数完成
    datalist = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg
      }
    })
  }

  let fileData = []
  fileData.push(header)
  let dataResult = datalist.data || datalist.result.data
  dataResult.forEach(item => {
    fileData.push(setData(item))
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
  let downloadUrl = await getDownloadUrl(fileID)
  return {
    fileID,
    downloadUrl
  }
}

async function getDownloadUrl(fileID) {
  // 获取文件下载链接
  let msgCheckUrl = 'https://api.weixin.qq.com/tcb/batchdownloadfile?access_token='
  // 入口凭证
  let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  let tokenResponse = await rp(tokenUrl)
  let token = JSON.parse(tokenResponse).access_token
  let fileInfo = {
    "env": "luwupingserver-zg879",
    "file_list": [
      {
        "fileid": fileID,
        "max_age": 7200
      }
    ]
  }
  let option = {
    method: 'POST',
    uri: msgCheckUrl + token,
    body: fileInfo,
    json: true // Automatically stringifies the body to JSON
  }
  let result = await rp(option)
  if (result.file_list) {
    return result.file_list[0]['download_url']
  }
  return ''
}

function setData (item) {
  let arr = []
  arr.push(item.area)
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
  arr.push(item.note)
  return arr
}
