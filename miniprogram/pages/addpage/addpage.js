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
      percent: null,
      // 提交人公司
      company: '',
      // 提交人姓名
      submitter: '',
      // 地区
      area: ''
    },
    // 表格数据空备份，用做还原表格
    formDataCopy: {},
    // 品牌选项值
    isOlympusOptions: ['Olympus', '其它'],
    // 弹窗按钮
    oneButton: [{ text: '确定' }],
    // 弹窗开关
    dialogShow: false,
    // 提交按钮禁用
    submitBtnDisable: false,
    // 结束年份
    endYear: '2020-01-01',
    // 型号选项
    olympusModelOptions: [
      { 'gid': 0, 'name': 'OTV--S400', 'checked': false},
      { 'gid': 1, 'name': 'OTV-S300', 'checked': false},
      { 'gid': 2, 'name': 'OTV-S190', 'checked': false},
      { 'gid': 3, 'name': 'CV-190', 'checked': false},
      { 'gid': 4, 'name': '3D', 'checked': false},
      { 'gid': 5, 'name': 'OTV-S7PRO', 'checked': false},
      { 'gid': 6, 'name': 'OTV-S7', 'checked': false},
      { 'gid': 7, 'name': 'CV-170', 'checked': false}
    ],
    // 地区范围
    areaOptions: [
      '昆明市','曲靖市','玉溪市','昭通市','丽江市','普洱市','保山市','临沧市','楚雄州','红河州','迪庆州','文山州','西双版纳州','大理州','德宏州','怒江州'
    ]
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let endDate = this.getDate()
    let b = JSON.parse(JSON.stringify(this.data.formData))
    this.setData({
      formDataCopy: b,
      endYear: endDate
    })
    this.getPersonInfo()
  },
  /**
   * 获取今年年份
   */
  getDate () {
    let now = new Date()
    return `${now.getFullYear()}-01-01`
  },
  /**
   * 提交数据
   */
  submitForm: function () {
    if (validateJs.validate(this.data.formData)) {
      this.setData({ submitBtnDisable: true })
      wx.showLoading({ title: '数据提交中...' })
      // 转换成中文名字地区后提交数据
      let submitData = JSON.parse(JSON.stringify(this.data.formData))
      submitData['area'] = this.data.areaOptions[submitData.area]
      wx.cloud.callFunction({
        name: 'add',
        data: submitData
      }).then(res => {
        this.enableBtnAndHideLoading()
        this.savePersonInfo()
        this.resetFrom()
        this.navigatorToResultPage()
      }).catch(() => {
        this.enableBtnAndHideLoading()
        wx.showToast({ title: '提交失败!', icon: 'none' })
      })
    }
  },
  navigatorToResultPage () {
    wx.navigateTo({
      url: '/pages/result/result',
      fail() {
        wx.showToast({ title: '提交成功！' })
      }
    })
  },
  /**
   * 提交成功后关闭提交按钮禁用和隐藏loading
   */
  enableBtnAndHideLoading () {
    this.setData({
      submitBtnDisable: false
    })
    wx.hideLoading()
  },
  formInputChange (e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`formData.${field}`]: e.detail.value })
  },
  bindIsOlympusChange: function (e) {
    let value = e.detail.value
    let brand = 'Olympus'
    // 如果品牌名称选择其它
    if (value === '1') {
      brand = ''
      this.resetOlympusModel()
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
  bindAreaChange: function (e) {
    this.setData({ [`formData.area`]: e.detail.value })
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
    this.setData({ dialogShow: false })
  },
  /**
   * 重置olympus型号选择
   */
  resetOlympusModel () {
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
  },
  /**
   * 重置表单并滚到顶部
   */
  resetFrom () {
    this.resetOlympusModel()
    let emptyFormData = JSON.parse(JSON.stringify(this.data.formDataCopy))
    this.setData({ formData: emptyFormData })
    this.scrollToTop()
    this.getPersonInfo()
  },
  scrollToTop () {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /**
   * 保存用户信息到本地，以便后续填充
   */
  savePersonInfo () {
    let { company, submitter, area } = this.data.formData
    try {
      wx.setStorageSync('company', company)
      wx.setStorageSync('submitter', submitter)
      wx.setStorageSync('area', area)
    } catch (e) { }
  },
  /**
   * 自动填充上次提交的用户信息
   */
  getPersonInfo () {
    // 设置上缓存的值
    try {
      let company = wx.getStorageSync('company')
      if (company) {
        let submitter = wx.getStorageSync('submitter')
        let area = wx.getStorageSync('area')
        this.setData({
          ['formData.company']: company,
          ['formData.submitter']: submitter,
          ['formData.area']: parseInt(area)
        })
      }
    } catch (e) { }
  }
})