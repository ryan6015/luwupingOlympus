// miniprogram/pages/querypage/querypage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btnDisable: false,
    fileID: '',
    fileUrl: '',
    viewFile: false
  },
  exportExcel () {
    let that = this
    this.setData({ btnDisable: true })
    wx.showLoading({
      title: '正在生成...'
    })
    // 服务端生成excel
    wx.cloud.callFunction({
      name: 'export',
      data: {}
    }).then(res => {
      wx.hideLoading()
      this.setData({
        btnDisable: false,
        fileID: res.result.fileID,
        fileUrl: res.result.downloadUrl
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '生成文件失败',
        icon: 'none'
      })
      that.setData({ btnDisable: false })
      throw err
    })
  },
  /**
   * 在线预览excel
   */
  viewExcel () {
    let that = this
    this.setData({ viewFile: true })
    wx.showLoading({ title: '正在打开文件...' })
    wx.cloud.downloadFile({
      fileID: this.data.fileID
    }).then(res => {
      wx.openDocument({
        filePath: res.tempFilePath,
        fileType: 'xlsx',
        fail: function () {
          wx.showToast({ title: '预览文件失败' })
        },
        complete: function () {
          that.setData({ viewFile: false })
          wx.hideLoading()
        }
      })
    })
  },
  /**
   * 点击复制到粘贴板
   */
  copyLink () {
    wx.setClipboardData({
      data: this.data.fileUrl,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        })
      },
      fail: function () {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  }
})