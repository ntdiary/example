const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saveKeytar: (val) => ipcRenderer.invoke('saveKeytar', val),
  getKeytar: () => ipcRenderer.invoke('getKeytar'),
  encrypt: (val) => ipcRenderer.invoke('encrypt', val),
  decrypt: (val) => ipcRenderer.invoke('decrypt', val),
});