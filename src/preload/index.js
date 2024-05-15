import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'

const api = {
  idletimer: (callback) => ipcRenderer.on("idletime", callback),
  screenshotSrc: (callback) => ipcRenderer.on("ssUrl", callback),
  showidlemoadl: (callback) => ipcRenderer.on("showIdlemodal", callback),
  activitypersent: (callback) => ipcRenderer.on("activitypersent", callback),
  auth: (callback) => ipcRenderer.on("auth", callback),
  Savetime: (callback) => ipcRenderer.on("saveTime", callback)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
