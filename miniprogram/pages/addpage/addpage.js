// miniprogram/pages/addpage/addpage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      hospitalName: ''
    },
    isOlympusOptions: ['Olympus', '其它'],
    isOlympus: null,
    olympusModel: [],
    olympusModelOptions: [
      { 'name': 'OTV--S400', 'checked': false},
      { 'name': 'OTV-S300', 'checked': false},
      { 'name': 'OTV-S190', 'checked': false},
      { 'name': 'CV-190', 'checked': false},
      { 'name': '3D', 'checked': false},
      { 'name': 'OTV-S7PRO', 'checked': false},
      { 'name': 'OTV-S7', 'checked': false},
      { 'name': 'CV-170', 'checked': false}
    ]
  },
  submitForm: function () {
    let that = this
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        wx.showToast({
          title: errors[0]['message']
        })
      } else {
        wx.cloud.callFunction({
          name: 'add',
          data: {
            'hospitalName': that.data.formData.hospitalName
          }
        }).then(res => {
          wx.showToast({
            title: 'success'
          })
        }).catch(() => {
          wx.showToast({
            title: 'fail',
            type: 'warn'
          })
        })
      }
    })
  },
  formInputChange (e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },
  bindIsOlympusChange: function (e) {
    this.setData({
      isOlympus: e.detail.value
    })
  },
  bindOlympusModelChange: function (e) {
    var checkboxItems = this.data.olympusModelOptions, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
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
      year: e.detail.value,
      [`formData.year`]: e.detail.value
    })
  }
})