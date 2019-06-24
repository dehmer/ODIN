import path from 'path'
import url from 'url'
import { app, BrowserWindow } from 'electron'
import { K, noop } from '../shared/combinators'

// Disable for production:
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const on = emitter => ([event, handler]) => emitter.on(event, handler)

let mainWindow

const createWindow = name => {
  const options = {
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  }

  mainWindow = K(new BrowserWindow(options))(window => {
    // hot deployment in development mode
    const hotDeployment = () =>
      process.defaultApp ||
      /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
      /[\\/]electron[\\/]/.test(process.execPath)

    const devServer = () => process.argv.indexOf('--noDevServer') === -1

    const indexURL = (hotDeployment() && devServer())
      ? url.format({
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: 'index.html',
        slashes: true
      })
      : url.format({
        protocol: 'file:',
        pathname: path.join(app.getAppPath(), 'dist', 'index.html'),
        slashes: true
      })

    window.loadURL(indexURL)
    window.on('close', () => (mainWindow = null))
    window.once('ready-to-show', () => window.show())
  })
}

;(() => {
  const quit = process.platform !== 'darwin' ? app.quit : noop
  const activate = mainWindow === null ? () => createWindow('main') : noop

  Object.entries({
    'ready': createWindow,
    'window-all-closed': quit,
    'activate': activate
  }).forEach(on(app))
})()
