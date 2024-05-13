import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  idletimer: (callback) => ipcRenderer.on("idletime", callback),
  screenshotSrc: (callback) => ipcRenderer.on("ssUrl", callback),
  showidlemoadl: (callback) => ipcRenderer.on("showIdlemodal", callback),
  activitypersent: (callback) => ipcRenderer.on("activitypersent", callback),
  auth: (callback) => ipcRenderer.on("auth", callback),
  Savetime: (callback) => ipcRenderer.on("saveTime" , callback)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
