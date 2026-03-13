export default {
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/message/index',
    'pages/message/detail/index',
    'pages/room/index',
    'pages/contract/index',
    'pages/approval/index',
    'pages/profile/index',
    'pages/profile/edit/index',
    'pages/profile/phone/index',
    'pages/profile/password/index',
    'pages/profile/security/index',
    'pages/company/pay/index',
    'pages/company/switch/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'Homi 管理端',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8a8f99',
    selectedColor: '#3478F6',
    backgroundColor: '#f6f7f9',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '工作台',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息',
        iconPath: 'assets/tabbar/xiaoxi.png',
        selectedIconPath: 'assets/tabbar/xiaoxi-active.png'
      },
      {
        pagePath: 'pages/approval/index',
        text: '审批',
        iconPath: 'assets/tabbar/approval.png',
        selectedIconPath: 'assets/tabbar/approval-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ]
  }
}
