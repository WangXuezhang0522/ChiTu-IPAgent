import { app, Tray, Menu, ipcMain, nativeImage } from 'electron';
import path from 'path';

class TrayWindow {
    constructor() {
        this.tray = null;
    }

    // 初始化托盘
    initTray() {

        // 托盘图标
        const iconPath = path.join(__static, '/icons/icon.png');
        const icon = nativeImage.createFromPath(iconPath);
        this.tray = new Tray(icon);

        // 托盘右键菜单
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '打开助手',
                click: () => {
                    app.show();
                }
            },
            {
                label: '隐藏',
                click: () => {
                    app.hide();
                }
            },
            {
                label: '退出',
                click: () => {
                    app.quit();
                }
            }
        ]);

        this.tray.setToolTip('赤兔IP代理');
        this.tray.setContextMenu(contextMenu);

        // 托盘点击事件
        this.tray.on('click', () => {
            // app.show();
        });

       //点击关闭按钮隐藏到托盘
        ipcMain.on('window-close', () => {
            app.hide();
        });

    }

}

export default TrayWindow;
