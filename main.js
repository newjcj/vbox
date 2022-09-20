const { app, globalShortcut, Menu, ipcMain, dialog } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const Store = require('electron-store')
const QiniuManager = require('./src/utils/QiniuManager')
const settingsStore = new Store({ name: 'Settings' })
const fileStore = new Store({ name: 'Files Data' })
const userStore = new Store({ name: 'userStore' })
let mainWindow, settingsWindow

const createManager = () => {
  const accessKey = settingsStore.get('accessKey')
  const secretKey = settingsStore.get('secretKey')
  const bucketName = settingsStore.get('bucketName')
  return new QiniuManager(accessKey, secretKey, bucketName)
}
app.on('ready', () => {

  Menu.setApplicationMenu(null) // null值取消顶部菜单栏 
  const mainWindowConfig = {
    width: 540,
    height: 868,
    title: "vobx工具盒子",
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  }
  const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './index.html')}`
  mainWindow = new AppWindow(mainWindowConfig, urlLocation)
  // 在开发环境和生产环境均可通过快捷键打开devTools
  globalShortcut.register('ctrl+i', function () {
    mainWindow.webContents.openDevTools()
  })
  globalShortcut.register('ctrl+w', function () {
    mainWindow.close()
  })
  globalShortcut.register('ctrl+q', function () {
    mainWindow.minimize()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // set the menu
  //let menu = Menu.buildFromTemplate(menuTemplate)
  //Menu.setApplicationMenu(menu)
  // hook up main events
  ipcMain.on('login', () => {
  })
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingsWindow.removeMenu()
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  ipcMain.on('upload-file', (event, data) => {
    const manager = createManager()
    manager.uploadFile(data.key, data.path).then(data => {
      console.log('上传成功', data)
      mainWindow.webContents.send('active-file-uploaded')
    }).catch(() => {
      dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
    })
  })
  ipcMain.on('download-file', (event, data) => {
    const manager = createManager()
    const filesObj = fileStore.get('files')
    const { key, path, id } = data
    manager.getStat(data.key).then((resp) => {
      const serverUpdatedTime = Math.round(resp.putTime / 10000)
      const localUpdatedTime = filesObj[id].updatedAt
      if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
        manager.downloadFile(key, path).then(() => {
          mainWindow.webContents.send('file-downloaded', { status: 'download-success', id })
        })
      } else {
        mainWindow.webContents.send('file-downloaded', { status: 'no-new-file', id })
      }
    }, (error) => {
      if (error.statusCode === 612) {
        mainWindow.webContents.send('file-downloaded', { status: 'no-file', id })
      }
    })
  })
  ipcMain.on('save-user', (event, user) => {
    userStore.set('user', user)
  })
  ipcMain.on('w-close', function () {
    mainWindow.close()
  })
  ipcMain.on('w-min', function () {
    mainWindow.minimize();
  })
  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true)
    const manager = createManager()
    const filesObj = fileStore.get('files') || {}
    const uploadPromiseArr = Object.keys(filesObj).map(key => {
      const file = filesObj[key]
      return manager.uploadFile(`${file.title}.md`, file.path)
    })
    Promise.all(uploadPromiseArr).then(result => {
      console.log(result)
      // show uploaded message
      dialog.showMessageBox({
        type: 'info',
        title: `成功上传了${result.length}个文件`,
        message: `成功上传了${result.length}个文件`,
      })
      mainWindow.webContents.send('files-uploaded')
    }).catch(() => {
      dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
    }).finally(() => {
      mainWindow.webContents.send('loading-status', false)
    })
  })
  ipcMain.on('config-is-saved', () => {
    // watch out menu items index for mac and windows
    let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2]
    const switchItems = (toggle) => {
      [1, 2, 3].forEach(number => {
        qiniuMenu.submenu.items[number].enabled = toggle
      })
    }
    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
    if (qiniuIsConfiged) {
      switchItems(true)
    } else {
      switchItems(false)
    }
  })
})
