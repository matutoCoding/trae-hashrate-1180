export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/booking/index',
    'pages/discount/index',
    'pages/mine/index',
    'pages/rink-detail/index',
    'pages/booking-detail/index',
    'pages/bill-detail/index',
    'pages/skate-rental/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '冰场预约',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f0f9ff'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/booking/index',
        text: '预约'
      },
      {
        pagePath: 'pages/discount/index',
        text: '优惠'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
