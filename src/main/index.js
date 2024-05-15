import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  dialog,
  ipcRenderer,
  Notification,
  Tray
} from 'electron'
import cron from 'node-cron'
import { format } from 'date-fns'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import "./store/index";

import icon from '../../resources/icon.png?asset'
import {
  startDetection,
  stopDetection,
  getInteractionTimestamps,
  resetInteractionTimeStampsForActivity
} from './InputDetection'
import { calculateActivityPercentage, calculateIdleTime } from './ActivityAnalyser'
import { GivePermission } from './Permissions'
import { takeScreenshotLinux } from './CronJobs'
import takeScreenshot from './CronJobs'
import { formatDateToDefaultFormat, getTimeSlot } from './helpers/date'


const isPackaged = app.isPackaged

let mainWindow

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('electron', process.execPath, [
      path.resolve(process.argv[1]),
      console.log(path.resolve(process.argv[1]))
    ])
  }
} else {
  app.setAsDefaultProtocolClient('electron')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  console.log('nolock')
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('yess')
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    mainWindow.webContents.send('auth', {
      commandLine
    })
    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`)
  })

  app.on('open-url', (event, url) => {
    console.log('open-url event triggered:', url)

    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (!isPackaged) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  if (process.platform === 'linux') {
    GivePermission()
  }
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let mainJob
let idleTimerJob

ipcMain.on('IdlemodalHasbeemclosed', (e, idleTimeAddedByuser) => {
  if (idleTimeAddedByuser) {
    console.log(idleTimeAddedByuser, "lollllllllll")
    const idleArr = getInteractionTimestamps()
    const lastIdleReportTime = idleArr?.interactionTimestamps[idleArr?.interactionTimestamps.length - 1].time
    const AddedTime = Date.now()
  }
  console.log('modal has been closed')
  startDetection('mouse', mainWindow)
  startDetection('keyboard', mainWindow)
})

ipcMain.on('startdetection', (e, projectId) => {
  const projectStartTime = new Date()

  if (global.sharedVariables.timerIsRunning) {
    const activityLength = global.sharedVariables.userActivity.length
    global.sharedVariables.userActivity = global.sharedVariables.userActivity.map((activity, index) => (index === activityLength - 1 ? { ...activity, mouse: global.sharedVariables.mouseMovements, keyboard: global.sharedVariables.keyboardMovements } : activity))
    global.sharedVariables.userActivity.push({ time_slot: getTimeSlot(projectStartTime), start_time: formatDateToDefaultFormat(projectStartTime), project_id: projectId, mouse: 0, keyboard: 0 })
  } else {
    global.sharedVariables.userActivity.push({ time_slot: getTimeSlot(projectStartTime), start_time: formatDateToDefaultFormat(projectStartTime), project_id: projectId, mouse: 0, keyboard: 0 })
  }
  global.sharedVariables.timerIsRunning = true

  if (mainJob) {
    mainJob.stop()
  }

  startDetection('mouse', mainWindow, projectId)
  startDetection('keyboard', mainWindow, projectId)

  console.log(global.sharedVariables.userActivity, "user variable")
  mainJob = cron.schedule('*/10 * * * *', async () => {
    const activityArr = getInteractionTimestamps()
    const currenttimestamp = Date.now()
    const idleTime = calculateIdleTime(activityArr?.interactionTimestamps, currenttimestamp)

    const activityLength = global.sharedVariables.userActivity.length
    global.sharedVariables.userActivity = global.sharedVariables.userActivity.map((activity, index) => (index === activityLength - 1 ? { ...activity, mouse: global.sharedVariables.mouseMovements, keyboard: global.sharedVariables.keyboardMovements } : activity))


    if (idleTime > 0) {
      mainWindow.webContents.send('showIdlemodal', idleTime)
      mainWindow.restore()
      stopDetection('mouse')
      stopDetection('keyboard')
    } else {



    }
    const apiSuccess = false
    if (apiSuccess) {
      resetInteractionTimeStampsForActivity()
      global.sharedVariables.userActivity = []
    }
    global.sharedVariables.userActivity.push({ time_slot: getTimeSlot(projectStartTime), start_time: formatDateToDefaultFormat(projectStartTime), project_id: projectId, mouse: 0, keyboard: 0 })

  })
})

ipcMain.on('stopdetection', () => {
  global.sharedVariables.timerIsRunning = false

  mainJob.stop()
  stopDetection('mouse')
  stopDetection('keyboard')
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
// function takeScreenshotLinux() {
//   console.log("screenshot execution")
//   const screenshotPath = path.join(__dirname, 'screenshotoll.png');

//   exec(`gnome-screenshot -d 2 -f "${screenshotPath}"`, (error, stdout, stderr) => {
//       if (error) {
//           console.error(`Error: ${error.message}`);
//           return;
//       }
//       if (stderr) {
//           console.error(`stderr: ${stderr}`);
//           return;
//       }
//       console.log(`stdout: ${stdout}`);

//       fs.readFile(screenshotPath, (err, data) => {
//           if (err) {
//               console.error(`Error reading file: ${err}`);
//               return;
//           }

//           console.log('Screenshot data loaded, file size:', data.length);

//           const notification = new Notification({
//               title: "Screenshot Taken",
//               body: "Screenshot has been captured successfully",
//           });
//           notification.show();
//       });
//   });
