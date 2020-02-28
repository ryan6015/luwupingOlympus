// miniprogram/pages/querypage/querypage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btnDisable: false,
    fileID: '',
    fileUrl: '',
    viewFile: false,
    isAdmin: false
  },
  onReady () {
    let that = this
    try {
      var isAdminValue = wx.getStorageSync('isAdmin')
      var checktime = wx.getStorageSync('checktime')
      if (isAdminValue && checktime) {
        // 校验是不是超过5天
        const TIMEZONE = 1000 * 60 * 60 * 24 * 5
        let now = new Date().getTime()
        let checktimes = checktime.getTime()
        if (now - checktimes > TIMEZONE) {
          wx.removeStorage({ key: "isAdmin" })
          wx.removeStorage({ key: "checktime" })
        } else {
          this.setData({ isAdmin: true })
        }
      }
    } catch (e) { }
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
  },
  onGotUserInfo (e) {
    let { userInfo } = e.detail
    // 通过校验
    if (e.detail.userInfo) {
      wx.showLoading({ title: '校验中...' })
      wx.cloud.callFunction({
        name: 'checkAdmin',
        data: userInfo
      }).then(res => {
        this.setAdmin(res.result, userInfo)
      }).catch(() => {
        this.setAdmin('no', userInfo)
      })
    }
  },
  setAdmin(result, userInfo) {
    wx.hideLoading()
    if (result === 'yes') {
      wx.setStorage({ key: "isAdmin", data: "yes" })
      wx.setStorage({ key: "checktime", data: new Date() })
      this.setData({ isAdmin: true })
      wx.showToast({ title: `欢迎管理员${userInfo.nickName}~`, icon: 'none' })
    } else {
      wx.showToast({ title: `${userInfo.nickName}您不具有管理员权限`, icon: 'none' })
      this.setData({ isAdmin: false })
      wx.removeStorage({ key: "isAdmin" })
      wx.removeStorage({ key: "checktime" })
    }
  }
})