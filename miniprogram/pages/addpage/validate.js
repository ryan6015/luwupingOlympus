// 字段名称对应
const fieldName = {
  hospitalName: '医院名称',
  department: '科室',
  isOlympus: '品牌名称',
  olympusModel: 'Olympus品牌型号',
  laparNum: '腔镜数量',
  brand: '其它品牌名称',
  model: '型号',
  year: '购买年份',
  bedNum: '科室床位数',
  income: '科室收入',
  operationNum: '科室总手术量',
  percent: '腔镜手术占比'
}

const fieldType = {
  hospitalName: 'string',
  department: 'string',
  isOlympus: 'number',
  olympusModel: 'string',
  laparNum: 'number',
  brand: 'string',
  model: 'string',
  year: 'number',
  bedNum: 'number',
  income: 'number',
  operationNum: 'number',
  percent: 'number'
}

const TEXT_MAX_LEN = 100
const NUM_MAX_LEN = 20
/**
 * 验证数据
 */
function validate (formData) {
  if (isEmpty(formData.isOlympus)) {
    notify(`请选择${fieldName['isOlympus']}`)
    return false
  }
  let checkItem = ['hospitalName', 'department', 'laparNum', 'brand', 'olympusModel', 'year', 'bedNum', 'income', 'operationNum', 'percent']
  // 为其它的时候
  if (formData.isOlympus == 1) {
    checkItem = ['hospitalName', 'department', 'laparNum', 'brand', 'model', 'year', 'bedNum', 'income', 'operationNum', 'percent']
  }
  let isok = true
  for (let i = 0, le = checkItem.length; i < le; i++) {
    let limit = fieldType[checkItem[i]] === 'string' ? TEXT_MAX_LEN : NUM_MAX_LEN
    if (!textValidate(formData, checkItem[i], limit)) {
      isok = false
      break
    }
    if (fieldType[checkItem[i]] === 'number' && !isNumber(formData[checkItem[i]])) {
      notify(`${fieldName[checkItem[i]]}只能输入数字`)
      isok = false
      break
    }
  }
  if (!isok) {
    return false
  }
  if (formData.isOlympus == 1) {
    let percent = parseFloat(formData.percent)
    if (percent < 0 || percent > 100) {
      notify(`${fieldName['percent']}合法值为0-100`)
      return false
    }
  }
  return true
}

function textValidate (formData, filed, len) {
  if (isEmpty(formData[filed])) {
    notify(`请输入${fieldName[filed]}`)
    return false
  }
  if (isGtLength(formData[filed], len)) {
    notify(`${fieldName[filed]}超出长度限制`)
    return false
  }
  return true
}

function notify (text) {
  wx.showToast({
    title: text,
    icon: 'none',
    duration: 2000
  })
}
/**
 * 判断是否为空
 */
function isEmpty (value) {
  if (value === undefined || value === null || value === "") {
    return true
  }
  if (value instanceof Array && value.length === 0) {
    return true
  }
  if (typeof value === 'object' && JSON.stringify(value) == "{}") {
    return true
  }
  return false
}

/**
 * 校验长度，是否超过len
 */
function isGtLength (value, len) {
  if (typeof value === 'object') {
    return false
  }
  let length = 0
  if (!isEmpty(value)) {
    length = value.toString().length
  }
  return length > len
}

function isNumber (value) {
  let re = /^[0-9]+.?[0-9]*$/
  return re.test(value)
}

module.exports.validate = validate 