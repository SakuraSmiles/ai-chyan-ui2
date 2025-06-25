// 确保使用正确的模块引入方式
const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统相关API
  platform: process.platform,
  showErrorDialog: (title, message) => ipcRenderer.invoke('show-error-dialog', title, message),
  
  // 文件系统API
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  
  // 应用控制API
  quitApp: () => ipcRenderer.send('quit-app'),
  
  // 窗口控制API（如果需要自定义标题栏）
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // 监听主进程消息
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', callback),
  
  // 窗口状态变化
  onWindowState: (callback) => ipcRenderer.on('window-state-changed', callback)
});

// 可选：暴露版本信息
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});