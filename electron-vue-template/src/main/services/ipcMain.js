import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import Server from '../server/index'
import { winURL } from '../config/StaticPath'
import downloadFile from './downloadFile'
import Update from './checkupdate'
import { updater } from './HotUpdater'
import * as fs from "node:fs";
import path from "path";
import { exec } from "child_process";
import os from "os";

export default {
    Mainfunc(IsUseSysTitle) {
        const allUpdater = new Update();
        ipcMain.handle('IsUseSysTitle', async () => {
            return IsUseSysTitle
        })
        ipcMain.handle('windows-mini', (event, args) => {
            BrowserWindow.fromWebContents(event.sender)?.minimize()
        })
        ipcMain.handle('window-max', async (event, args) => {
            if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
                BrowserWindow.fromWebContents(event.sender)?.unmaximize()
                return { status: false }
            } else {
                BrowserWindow.fromWebContents(event.sender)?.maximize()
                return { status: true }
            }
        })
        ipcMain.handle('window-close', (event, args) => {
            BrowserWindow.fromWebContents(event.sender)?.close()
        })
        ipcMain.handle('start-download', (event, msg) => {
            downloadFile.download(BrowserWindow.fromWebContents(event.sender), msg.downloadUrL)
        })
        ipcMain.handle('check-update', (event, args) => {
            allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
        })
        ipcMain.handle('confirm-update', () => {
            allUpdater.quitInstall()
        })
        ipcMain.handle('hot-update', (event, arg) => {
            updater(BrowserWindow.fromWebContents(event.sender))
        })
        ipcMain.handle('open-messagebox', async (event, arg) => {
            const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
                type: arg.type || 'info',
                title: arg.title || '',
                buttons: arg.buttons || [],
                message: arg.message || '',
                noLink: arg.noLink || true
            })
            return res
        })
        ipcMain.handle('open-errorbox', (event, arg) => {
            dialog.showErrorBox(
                arg.title,
                arg.message
            )
        })
        ipcMain.handle('statr-server', async () => {
            try {
                const serveStatus = await Server.StatrServer()
                return serveStatus
            } catch (error) {
                dialog.showErrorBox(
                    '错误',
                    error
                )
            }
        })
        ipcMain.handle('stop-server', async (event, arg) => {
            try {
                const serveStatus = await Server.StopServer()
                return serveStatus
            } catch (error) {
                dialog.showErrorBox(
                    '错误',
                    error
                )
            }
        })

        let childWin = null;
        let cidArray = [];
        ipcMain.handle('open-win', (event, arg) => {
            let cidJson = { id: null, url: '' }
            let data = cidArray.filter((currentValue) => {
                if (currentValue.url === arg.url) {
                    return currentValue
                }
            })
            if (data.length > 0) {
                //获取当前窗口
                let currentWindow = BrowserWindow.fromId(data[0].id)
                //聚焦窗口
                currentWindow.focus();
            } else {
                //获取主窗口ID
                let parentID = event.sender.id
                //创建窗口
                childWin = new BrowserWindow({
                    width: arg?.width || 842,
                    height: arg?.height || 595,
                    //width 和 height 将设置为 web 页面的尺寸(译注: 不包含边框), 这意味着窗口的实际尺寸将包括窗口边框的大小，稍微会大一点。
                    useContentSize: true,
                    //自动隐藏菜单栏，除非按了Alt键。
                    autoHideMenuBar: true,
                    //窗口大小是否可调整
                    resizable: arg?.resizable ?? false,
                    //窗口的最小高度
                    minWidth: arg?.minWidth || 642,
                    show: arg?.show ?? false,
                    //窗口透明度
                    opacity: arg?.opacity || 1.0,
                    //当前窗口的父窗口ID
                    parent: parentID,
                    frame: IsUseSysTitle,
                    webPreferences: {
                        nodeIntegration: true,
                        webSecurity: false,
                        //使用webview标签 必须开启
                        webviewTag: arg?.webview ?? false,
                        // 如果是开发模式可以使用devTools
                        devTools: process.env.NODE_ENV === 'development',//Q:如何关闭开发者工具A

                        // 在macos中启用橡皮动画
                        scrollBounce: process.platform === 'darwin',
                        // 临时修复打开新窗口报错
                        contextIsolation: false
                    }
                })
                childWin.loadURL(winURL + `#${arg.url}`)
                cidJson.id = childWin?.id
                cidJson.url = arg.url
                cidArray.push(cidJson)
                childWin.webContents.once('dom-ready', () => {
                    childWin.show()
                    childWin.webContents.send('send-data', arg.sendData)
                    if (arg.IsPay) {
                        // 检查支付时候自动关闭小窗口
                        const testUrl = setInterval(() => {
                            const Url = childWin.webContents.getURL()
                            if (Url.includes(arg.PayUrl)) {
                                childWin.close()
                            }
                        }, 1200)
                        childWin.on('close', () => {
                            clearInterval(testUrl)
                        })
                    }
                })
                childWin.on('closed', () => {
                    childWin = null
                    let index = cidArray.indexOf(cidJson)
                    if (index > -1) {
                        cidArray.splice(index, 1);
                    }
                })
            }
            childWin.on('maximize', () => {
                if (cidJson.id != null) {
                    BrowserWindow.fromId(cidJson.id).webContents.send("w-max", true)
                }
            })
            childWin.on('unmaximize', () => {
                if (cidJson.id != null) {
                    BrowserWindow.fromId(cidJson.id).webContents.send("w-max", false)
                }
            })
        })
        //判断是否安装了xedge,xedge进程是否存在
        ipcMain.handle('is-xedge-installed', async (event) => {
            return new Promise((resolve) => {
                let command;
        
                // 根据操作系统选择命令
                switch (os.platform()) {
                    case 'win32': // Windows
                        command = 'tasklist';
                        break;
                    case 'darwin': // macOS
                        command = 'ps aux | grep xedge';
                        break;
                    case 'linux': // Linux
                        command = 'ps aux | grep xedge';
                        break;
                    default:
                        resolve(false); // 不支持的操作系统
                        return;
                }
        
                exec(command, (error, stdout) => {
                    if (error) {
                        resolve(false);
                    } else {
                        // Windows 的处理
                        if (os.platform() === 'win32') {
                            resolve(stdout.includes('xedge.exe'));
                        } else {
                            // macOS 和 Linux 的处理
                            resolve(stdout.includes('xedge'));
                        }
                    }
                });
            });
        });

        // 打开外部浏览器 并且打开xedge下载页面
        ipcMain.handle('open-xedge', async (event, arg) => {
            let url = 'https://xedge.cc/download'
            //打开外部浏览器
            const { shell } = require('electron')
            shell.openExternal(url)
        })
        //判断是否安装了chrome
        ipcMain.handle('is-chrome-installed', async (event) => {
            return new Promise((resolve) => {
                let chromePath;

                // 根据操作系统设置Chrome的路径
                if (os.platform() === 'win32') {
                    chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
                } else if (os.platform() === 'darwin') {
                    chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
                } else {
                    chromePath = '/usr/bin/google-chrome'; // Linux常见路径
                }

                // 检查Chrome是否存在
                exec(`"${chromePath}" --version`, (error) => {
                    if (error) {
                        // Chrome未安装则返回一个false
                        resolve(false);
                    } else {
                        // Chrome已安装
                        resolve(true);
                        // event.returnValue = false;
                    }
                });
            });
        });

        // 打开外部浏览器 并且打开chrome下载页面
        ipcMain.handle('open-chrome', async (event, arg) => {
            let url = 'https://www.google.com/chrome/browser-tools/'
            //打开外部浏览器
            const { shell } = require('electron')
            shell.openExternal(url)
        })

        // 打开外部浏览器, 并且附加启动参数
        ipcMain.handle('open-browser', (event, args) => {
            console.log('open-browser', args)
            let userDir = app.getPath('userData')
            let userPath = path.join(userDir, args.network_name)
            //浏览器插件地址
            const extension = path.join(__static, '/赤兔AI同步助手v2.3-extension-1.0.0-draft');
            console.log('userPath', userPath)
            console.log('args', args.proxy)
            // 检查是否存在用户目录,如果不存在则创建
            if (!fs.existsSync(userPath)) {
                fs.mkdirSync(userPath, { recursive: true });
            }
            // 执行命令
            const exec = require('child_process').exec;
            //判断当前系统是win还是mac或者linux
            if (process.platform === 'darwin') {
                //mac
                let cmd = `open -na "Google Chrome" --args --proxy-server="socks5://${args.proxy}:1080" --user-data-dir="${userPath}" --load-extension="${extension}" "https://tool.lu/ip/"`
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log('get weather api error:' + stderr);
                    } else {
                        console.log('get weather api success:' + stdout);
                    }
                });
            } else if (process.platform === 'linux') {
                //linux
                let cmd = `google-chrome --proxy-server="socks5://${args.proxy}:1080" --user-data-dir="${userPath}" --load-extension="${extension}" "https://tool.lu/ip/"`
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log('get weather api error:' + stderr);
                    } else {
                        console.log('get weather api success:' + stdout);
                    }
                });
            } else {
                //win
                let cmd = `start chrome  --proxy-server="socks5://${args.proxy}:1080" --user-data-dir="${userPath}" --load-extension="${extension}" "https://tool.lu/ip/"`
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.log('get weather api error:' + stderr);
                    } else {
                        console.log('get weather api success:' + stdout);
                    }
                });
            }

        })
        //获取设备MAC地址并返回,适配windows和mac
        ipcMain.handle('getMac', async (event, args) => {
            return new Promise((resolve) => {
                let mac;
                if (process.platform === 'darwin') {
                    //mac
                    exec('ifconfig en0 | grep ether | awk \'{print $2}\'', (error, stdout) => {
                        if (error) {
                            resolve('获取mac地址失败');
                        } else {
                            mac = stdout.replace(/\n/g, '');
                            resolve(mac);
                        }
                    });
                } else {
                    //windows
                    exec('ipconfig /all | find "Physical Address"', (error, stdout) => {
                        if (error) {
                            resolve('获取mac地址失败');
                        } else {
                            mac = stdout.replace(/\n/g, '').replace(/ /g, '').split(':')[1];
                            resolve(mac);
                        }
                    });
                }
            });
        });
        //点击复制MAC地址
        ipcMain.handle('copyMac', async (event, args) => {
            return new Promise((resolve) => {
                let mac;
                if (process.platform === 'darwin') {
                    //mac
                    exec('ifconfig en0 | grep ether | awk \'{print $2}\'', (error, stdout) => {
                        if (error) {
                            resolve('获取mac地址失败');
                        } else {
                            mac = stdout.replace(/\n/g, '');
                            exec(`echo ${mac} | pbcopy`, (error, stdout) => {
                                if (error) {
                                    resolve('复制mac地址失败');
                                } else {
                                    resolve('复制mac地址成功');
                                }
                            });
                        }
                    });
                } else {
                    //windows
                    exec('ipconfig /all | find "Physical Address"', (error, stdout) => {
                        if (error) {
                            resolve('获取mac地址失败');
                        } else {
                            mac = stdout.replace(/\n/g, '').replace(/ /g, '').split(':')[1];
                            exec(`echo ${mac} | clip`, (error, stdout) => {
                                if (error) {
                                    resolve('复制mac地址失败');
                                } else {
                                    resolve('复制mac地址成功');
                                }
                            });
                        }
                    });
                }
            });
        });
        
    }
}
