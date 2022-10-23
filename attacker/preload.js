const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  stealSafeStorage: () => ipcRenderer.invoke('stealSafeStorage'),
  stealKeytar: () => ipcRenderer.invoke('stealKeytar'),
  decrypt: (val) => ipcRenderer.invoke('decrypt', val),
});