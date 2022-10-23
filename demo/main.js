const {app, BrowserWindow, ipcMain, safeStorage} = require('electron')
const serve = require('electron-serve');
const keytar = require('keytar');
const path = require('path');
const { session } = require('electron')

const loadURL = serve({directory: __dirname});

async function saveKeytar(e, val) {
  return await keytar.setPassword('demo keytar storage', 'keytar', val);
}

async function getKeytar() {
  return await keytar.getPassword('demo keytar storage', 'keytar');
}

async function encrypt(e, plain) {
  return safeStorage.encryptString(plain);
}

async function decrypt(e, buffer) {
  let plain = '';
  try {
    plain = safeStorage.decryptString(buffer)
  } catch (e) {
  }
  return plain;
}

app.whenReady().then(() => {
  ipcMain.handle('saveKeytar', saveKeytar);
  ipcMain.handle('getKeytar', getKeytar);
  ipcMain.handle('encrypt', encrypt);
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
    x: 10,
    y: 100,
    width: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  loadURL(mainWindow);
});

