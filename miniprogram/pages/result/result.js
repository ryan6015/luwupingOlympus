// miniprogram/pages/result/result.js
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  navigateToAdd () {
    this.navigatePage('/pages/addpage/addpage')
  },
  navigateToQuery () {
    this.navigatePage('/pages/resultpage/resultpage')
  },
  navigatePage (url) {
    wx.switchTab({
      url
    })
  }
})