'use strict'

import { app } from 'electron'
import initWindow from './services/windowManager'
import DisableButton from './config/DisableButton'
import electronDevtoolsInstaller, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import trayWindow from './services/trayWindow'

let tray = null

function onAppReady() {
  initWindow()
  DisableButton.Disablef12()
  
  // 托盘模式
  tray = new trayWindow()
  tray.initTray()
  
  if (process.env.NODE_ENV === 'development') {
    electronDevtoolsInstaller(VUEJS_DEVTOOLS)
      .then((name) => console.log(`installed: ${name}`))
      .catch(err => console.log('Unable to install `vue-devtools`: \n', err))
  }
}
//禁止程序多开，此处需要单例锁的同学打开注释即可
// const gotTheLock = app.requestSingleInstanceLock()
// if(!gotTheLock){
//   app.quit()
// }
app.isReady() ? onAppReady() : app.on('ready', onAppReady)
// 解决9.x跨域异常问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  // app.quit()
  // 最小化
  app.hide()
})
app.on('browser-window-created', () => {
  console.log('window-created')
})

// //关闭开发者工具
// app.on('web-contents-created', (event, contents) => {
//   contents.on('devtools-opened', () => {
//     contents.closeDevTools()
//   })
// })

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template')
    console.log('有于框架特殊性开发环境下无法使用')
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template')
}
