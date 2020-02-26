// miniprogram/pages/addpage/addpage.js
const validateJs = require('./validate.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      // 医院名称
      hospitalName: '',
      // 科室
      department: '',
      // 品牌名称是否是Olympus
      isOlympus: null,
      // Olympus品牌型号
      olympusModel: [],
      // 腔镜数量
      laparNum: null,
      // 品牌名称
      brand: '',
      // 型号
      model: '',
      // 购买年份
      year: '',
      // 科室床位数
      bedNum: null,
      // 科室收入
      income: null,
      // 科室总手术量
      operationNum: null,
      // 腔镜手术占比
      percent: null
    },
    isOlympusOptions: ['Olympus', '其它'],
    oneButton: [{ text: '确定' }],
    dialogShow: false,
    olympusModelOptions: [
      { 'gid': 0, 'name': 'OTV--S400', 'checked': false},
      { 'gid': 1, 'name': 'OTV-S300', 'checked': false},
      { 'gid': 2, 'name': 'OTV-S190', 'checked': false},
      { 'gid': 3, 'name': 'CV-190', 'checked': false},
      { 'gid': 4, 'name': '3D', 'checked': false},
      { 'gid': 5, 'name': 'OTV-S7PRO', 'checked': false},
      { 'gid': 6, 'name': 'OTV-S7', 'checked': false},
      { 'gid': 7, 'name': 'CV-170', 'checked': false}
    ]
  },
  submitForm: function () {
    let that = this
    console.log(this.data.formData)
    if (validateJs.validate(this.data.formData)) {
      this.setData({
        formDataText: JSON.stringify(this.data.formData),
        dialogShow: true
      })
    }
    // wx.cloud.callFunction({
    //   name: 'add',
    //   data: {
    //     'hospitalName': that.data.formData.hospitalName
    //   }
    // })
  },
  formInputChange (e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },
  bindIsOlympusChange: function (e) {
    let value = e.detail.value
    let brand = 'Olympus'
    // 如果品牌名称选择其它
    if (value === '1') {
      brand = ''
      let checkboxItems = this.data.olympusModelOptions
      // 清空之前的选择
      let newCheckboxItems = checkboxItems.map(item => {
        item.checked = false
        return item
      })
      this.setData({
        ['formData.olympusModel']: [],
        olympusModelOptions: newCheckboxItems
      })
    } else {
      this.setData({
        ['formData.model']: '',
        ['formData.year']: '',
        ['formData.bedNum']: '',
        ['formData.income']: '',
        ['formData.operationNum']: '',
        ['formData.percent']: ''
      })
    }
    this.setData({
      [`formData.isOlympus`]: e.detail.value,
      [`formData.brand`]: brand
    })
  },
  bindOlympusModelChange: function (e) {
    var checkboxItems = this.data.olympusModelOptions, values = e.detail.value
    for (var i = 0, lenI = checkboxItems.length; i < lenI; i++) {
      checkboxItems[i].checked = false
      for (var j = 0, lenJ = values.length; j < lenJ; j++) {
        if (checkboxItems[i].name == values[j]) {
          checkboxItems[i].checked = true
          break
        }
      }
    }
    this.setData({
      olympusModelOptions: checkboxItems,
      [`formData.olympusModel`]: e.detail.value
    });
  },
  bindYearChange (e) {
    this.setData({
      [`formData.year`]: e.detail.value
    })
  },
  tapDialogButton (e) {
    this.setData({
      dialogShow: false
    })
  }
})