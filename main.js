const { app, globalShortcut, Menu, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
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
Object.defineProperty(app,'isPackaged',{
  get(){
    return true
  }
})
//  在electron中，碰到不安全证书连接，会显示白屏，按照chrome在控制台用location.href跳转也无济于事
//  //忽略证书的检测
app.commandLine.appendSwitch('ignore-certificate-errors')

process.env.BASEURL = 'aaaaa'
app.on('ready', () => {
  console.log('ready-------')
  // autoUpdater.autoDownload = false
  // if (isDev) {
  //   //autoUpdater.checkForUpdates();
  //   autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
  //   autoUpdater.checkForUpdatesAndNotify();// product环境
  // } else {
  //   autoUpdater.checkForUpdatesAndNotify();// product环境
  // }
  // autoUpdater.on('error', (error)=>{
  //   dialog.showErrorBox('Error___jcj',error === null ? 'unknow' : error.message)
  // })
  // autoUpdater.on('checking-for-update', () => {
  //   //sendStatusToWindow('Checking for update...');
  //   dialog.showMessageBox({
  //     title: 'checking',
  //     message: 'checking...'
  //   }, () => {
  //   })
  // })
  // autoUpdater.on('update-available', (info) => {
  //   //sendStatusToWindow('Update available.');
  //   dialog.showMessageBox({
  //     type: 'info',
  //     title: '有新版本更新',
  //     message: '发现新版本，是否更新？',
  //     buttons: ['是', '否'],
  //   }, (buttonIndex) => {
  //     if (buttonIndex === 0) {
  //       console.log("开始下载中...")
  //       autoUpdater.downloadUpdate()
  //       console.log("开始下载中...111")
  //     }
  //   })
  // })
  // autoUpdater.on('update-not-available', (info) => {
  //   //sendStatusToWindow('Update not available.');
  //   // dialog.showMessageBox({
  //   //   title: '提醒',
  //   //   message: '无更新下载'
  //   // }, () => {
  //   // })
  // })
  // autoUpdater.on('download-progress', (progressObj) => {
  //   let log_message = "Download speed: " + progressObj.bytesPerSecond;
  //   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  //   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  //   //sendStatusToWindow(log_message);
  // })

  // autoUpdater.on('update-downloaded', (info) => {
  //   // 更新下载完毕
  //   //sendStatusToWindow('Update downloaded');
  //   dialog.showMessageBox({
  //     title: '安装更新',
  //     message: '更新下载完毕，请重新安装'
  //   }, () => {
  //     //安装
  //     setImmediate(() => { autoUpdater.quitAndInstall() })
  //   })
  // });



  Menu.setApplicationMenu(null) // null值取消顶部菜单栏 
  const mainWindowConfig = {
    width: 350,
    height: 598,
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
  // 不让窗口最大化
  mainWindow.setMaximizable(false)
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
