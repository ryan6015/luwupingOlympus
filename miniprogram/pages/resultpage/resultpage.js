// miniprogram/pages/resultpage/resultpage.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    totalRecord: 0,
    list: [],
    show: false,
    activeItem: {},
    buttons: [
      {
        type: 'default',
        text: '取消',
        value: 0
      },
      {
        type: 'primary',
        text: '提交',
        value: 1
      }
    ]
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '数据获取中...'
    })
    this.findData(1, function() {
      wx.hideLoading()
    })
  },
  /**
   * 查询数据
   */
  findData: function (pageIndex, callback) {
    wx.cloud.callFunction({
      'name': 'findSelfData',
      data: {
        pageIndex,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      let data = this.formatDisplay(res.result.pageData)
      if (pageIndex == 1) {
        this.setData({ list: data })
      } else {
        this.setData({ list: this.data.list.concat(data) })
      }
      this.setData({ 
        hasMore: res.result.hasMore,
        totalRecord: res.result.totalRecord
      })
      if (callback) {
        callback()
      }
    }).catch(() => {
      if (callback) {
        callback()
      }
    })
  },
  /**
   * 格式化页面显示
   */
  formatDisplay: function (list) {
    if (list && list.length > 0) {
      let numItem = ['laparNum', 'bedNum', 'income', 'operationNum']
      return list.map(item => {
        if (item.createtime) {
          item.createtime = this.formatTime(new Date(item.createtime))
        } else {
          item.createtime = '暂无'
        }
        if (item.olympusModel && item.olympusModel.length > 0) {
          item.model = item.olympusModel.join(',')
        }
        numItem.forEach(attr => {
          if (item[attr]) {
            item[attr] = this.format(item[attr])
          }
        })
        let laparNum
        return item
      })
    }
    return list
  },
  /**
   * 实现千分位
   */
  format (num) {
    var reg = /\d{1,3}(?=(\d{3})+$)/g
    return (num + '').replace(reg, '$&,')  
  },
  /**
   * 补全两位数
   */
  formatNumber (n) {
    return n > 9 ? n.toString() : '0' + n
  },
  // 参数number为毫秒时间戳，format为需要转换成的日期格式
  formatTime (time) {
    if (!time) return ''
    let year = time.getFullYear()
    let month = this.formatNumber(time.getMonth() + 1)
    let day = this.formatNumber(time.getDate())
    let hour = this.formatNumber(time.getHours())
    let minute = this.formatNumber(time.getMinutes())
    let seconds = this.formatNumber(time.getSeconds())
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + seconds
  },
  /**
   * 点击修改按钮
   */
  modify: function (e) {
    let _id = e.currentTarget.dataset['id']
    let datalist = this.data.list
    let activeItem
    let activeIndex
    for (let i = 0, len = datalist.length; i < len; i++) {
      if (datalist[i]['_id'] === _id) {
        activeItem = datalist[i]
        activeIndex = i
        break
      }
    }
    this.setData({
      activeIndex,
      activeItem: JSON.parse(JSON.stringify(activeItem)),
      show: true
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.findData(1, function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.hasMore) {
      wx.showToast({ title: '没有数据了~', icon: 'none' })
    } else {
      let pageIndex = this.data.pageIndex + 1
      this.setData({ pageIndex})
      wx.showLoading({ title: '数据获取中...' })
      this.findData(pageIndex, function() {
        wx.hideLoading()
      })
    }
  },
  bindTextAreaChange (e) {
    this.setData({ ['activeItem.note']: e.detail.value })
  },
  buttontap (e) {
    let that = this
    this.setData({ show: false })
    if (e.detail.index === 1) {
      const { _id, note } = this.data.activeItem
      wx.showLoading({ title: '数据提交中...' })
      wx.cloud.callFunction({
        name: 'updateRecord',
        data: {
          _id,
          note
        }
      }).then(res => {
        wx.hideLoading()
        if (res.result > 0) {
          wx.showToast({ title: '修改成功' })
          that.setData({ [`list[${this.data.activeIndex}].note`]: note })
        } else {
          wx.showToast({
            title: '修改失败',
            icon: 'none'
          })
        }
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        })
      })
    }
  }
})