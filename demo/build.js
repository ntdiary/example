const packager = require('electron-packager')

packager({
  dir: '.',
  ignore: /(.*darwin-x64|build\.js)/,
  overwrite: true,
  osxSign: {
    identity: process.env.IDENTITY,
  }
})