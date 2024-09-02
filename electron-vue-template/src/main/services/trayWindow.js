const {Tray, BrowserWindow, Menu, dialog, app} = require("electron");
const {platform} = require("os");
const {openDevTools, UseStartupChart} = require("../config/const");
const {winURL} = require("../config/StaticPath");
const ServerManagerService = require("../server/service/server.manager.service");
const QueueService = require("../server/service/queue.service");

class TrayWindow {
    constructor() {
        if (TrayWindow.instance) {
            return TrayWindow.instance
        }
        this.name = 'TrayWindow'
        this.tray = null
        this.trayBounds = null
        this.trayWindow = null
        TrayWindow.instance = this
        return TrayWindow.instance
    }

    createTray = (loadWindow) => {
        // 获取资源文件路径，__dirname指向当前文件所在目录
        const iconPath = `${__static}\\icons\\icon.ico`;
        this.tray = new Tray(iconPath);
        this.trayBounds = this.tray.getBounds()

        this.trayWindow = new BrowserWindow({
            width: 300,
            height: 300,
            frame: false,
            show: false,
            resizable: false,
            alwaysOnTop: true,
            title: '赤兔',
            skipTaskbar: true,
            titleBarStyle: platform().includes('win32') ? 'default' : 'hidden',
            icon: `${__static}\\icons\\icon.ico`,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
                webSecurity: false,
                // 如果是开发模式可以使用devTools
                devTools: process.env.NODE_ENV === 'development' || openDevTools,
                // devTools: false,
                // 在macos中启用橡皮动画
                scrollBounce: process.platform === 'darwin'
            }
        });


        this.trayWindow.setBounds({
            x: parseInt(this.trayBounds.x + (this.trayBounds.width / 2) - (this.trayWindow.getBounds().width / 2)),
            y: parseInt(this.trayBounds.y - this.trayWindow.getBounds().height)
        });

        this.trayWindow.loadURL(winURL)

        //if (process.env.NODE_ENV === 'development' || openDevTools) trayWindow.webContents.openDevTools()

        this.trayWindow.webContents.once('dom-ready', () => {
            this.trayWindow.show();

            if (loadWindow && typeof loadWindow.destroy == "function") loadWindow.destroy()

            // 10秒后隐藏
            setTimeout(() => {
                this.trayWindow.hide()
            }, 10000)
        })

        this.trayWindow.on('close', (event) => {
            event.preventDefault()
            this.trayWindow.hide()
        })
        this.trayWindow.on('closed', function () {
            // trayWindow.hide();
            console.log('trayWindow closed')
        });

        const contextMenu = Menu.buildFromTemplate([
            {
                label: '运行状态',
                click: () => {
                    this.trayWindow.show()
                }
            },
            /*{
                label: 'devtools',
                click: () => {
                    this.trayWindow.webContents.openDevTools()
                }
            },*/
            {
                label: '退出',
                click: () => {
                    const options = {
                        type: 'info',
                        title: '提示',
                        message: '退出程序后将不会处理任何消息,确定要退出吗？',
                        buttons: ['确定', '取消'],
                        defaultId: 0,
                        cancelId: 1
                    };
                    dialog.showMessageBox(options)
                        .then(async (result) => {
                            console.log(result.response); // 用户选择的按钮的索引值
                            if (result.response === 0) {
                               /* if (QueueService.queue.length > 0) {
                                    dialog.showMessageBox({
                                        type: 'info',
                                        title: '提示',
                                        message: '还有未处理完毕的任务,请稍后再试',
                                        buttons: ['确定'],
                                        defaultId: 0,
                                        cancelId: 0
                                    })
                                    return
                                }*/

                                // 检查是否有正在运行的定时任务
                                let timerStatus =await G.TimerLogUtil.hasRunning()
                                if (timerStatus.hasRunning) {
                                    // 强行结束定时任务
                                    await G.TimerLogUtil.forceStop()
                                }

                                ServerManagerService.stopAllServer().then(() => {
                                    this.trayWindow.destroy()
                                    app.quit()
                                }).catch((e) => {
                                    console.log('退出失败', e)
                                    logger.error('退出失败', JSON.stringify(e))
                                })
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }
            }
        ])
        this.tray.setToolTip('赤兔')
        this.tray.setContextMenu(contextMenu)
        // 点击系统托盘图标时显示主窗口
        this.tray.on('click', () => {
            if (this.trayWindow.isVisible()) {
                this.trayWindow.hide();
            } else {
                this.trayWindow.show();
            }
        });
        return this.tray
    }
    appQuit = () => {
        this.trayWindow.destroy()
        app.quit()
    }

}

module.exports = new TrayWindow()