import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // 添加这行
import fs from 'fs/promises';

// 解决 __dirname 在 ES 模块中不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.IS_DEV === 'true';

function createWindow() {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    // 通用配置 - 隐藏菜单栏
    autoHideMenuBar: true,
    
    // Windows 专属配置
    ...(isWindows && {
      titleBarOverlay: {
        color: '#2f3241',     // 标题栏区域颜色
        symbolColor: '#74b1be', // 最小化/最大化/关闭按钮颜色
        height: 30            // 标题栏高度
      }
    }),
    
    // macOS 专属配置
    ...(isMac && {
      titleBarStyle: 'hiddenInset' // 更现代的无边框样式
    }),
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // 重要：启用上下文隔离以确保安全
      contextIsolation: true, // 必须设置为 true
      // 禁用 Node.js 集成以提高安全性
      nodeIntegration: false, // 应该设置为 false
      // 启用沙箱环境
      sandbox: true
    }
  });
  // 开发环境加载Vite服务，生产环境加载静态文件
  win.loadURL(
    isDev 
      ? 'http://localhost:5173' 
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );
  
  if (isDev) win.webContents.openDevTools();
}

// 注册IPC处理程序
ipcMain.handle('show-error-dialog', (_, title, message) => {
  dialog.showErrorBox(title, message);
});

ipcMain.handle('read-file', async (_, filePath) => {
  return await fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('write-file', async (_, filePath, content) => {
  await fs.writeFile(filePath, content, 'utf-8');
});

ipcMain.on('quit-app', () => {
  app.quit();
});

app.whenReady().then(createWindow);

// 处理 macOS 的窗口激活事件
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 处理所有窗口关闭时的退出事件 (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});