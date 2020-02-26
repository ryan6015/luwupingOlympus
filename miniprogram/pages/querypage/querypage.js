// miniprogram/pages/querypage/querypage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btnDisable: false
  },
  exportExcel () {
    let that = this
    this.setData({
      btnDisable: true
    })
    wx.showLoading({
      title: '正在导出'
    })
    
    wx.cloud.callFunction({
      name: 'export',
      data: {}
    }).then(res => {
      let fileID = res.result
      wx.cloud.downloadFile({
        fileID
      }).then(res => {
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: 'xlsx',
          success: function (res) {
            that.setData({
              btnDisable: false
            })
            wx.hideLoading()
          }
        })
        // wx.saveFile({
        //   tempFilePath: res.tempFilePath,
        //   success (saveRes) {
        //     const savedFilePath = saveRes.savedFilePath
        //     wx.showToast({
        //       title: savedFilePath
        //     })
        //   }
        // })
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({
        title: '导出文件失败',
        type: 'none'
      })
      that.setData({
        btnDisable: true
      })
    })
  }
})