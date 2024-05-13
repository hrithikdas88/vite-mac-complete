import { exec, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { dialog, app } from 'electron'
import { execSync } from 'child_process'

const isPackaged = app.isPackaged
const processes = {} // This will track each spawned process by type


let interactionTimestamps = []
let interactionActivityTimestamps = []
let detectionStatus = false
export function getInteractionTimestamps() {
  return {
    interactionTimestamps: interactionTimestamps.slice(),
    interactionActivityTimestamps: interactionActivityTimestamps.slice(),
  };
}

export function resetInteractionTimeStampsForActivity() {
  console.log("resetInteractionTimeStampsForActivity trigered")
  return interactionActivityTimestamps = []
}

// Helper function to check if the executable exists
function checkExecutableExists(executablePath) {
  if (!fs.existsSync(executablePath)) {
    dialog.showErrorBox('Error', `${executablePath}`)
    // dialog.showErrorBox("Error", `${path.basename(executablePath)} file not found.`);
    return false
  }
  return true
}

// Handles data from the process's stdout
function handleData(data, type, mainWindow) {
  if (data && detectionStatus) {
    const timestamp = new Date()
    const foridletimeChecker = timestamp.getTime()
    const newEntry = {
      time: foridletimeChecker,
      type: type // 'mouse' or 'keyboard'
    }

      interactionTimestamps.push(newEntry)
  
   
    interactionActivityTimestamps.push(newEntry)
    // mainWindow.webContents.send("idletime", Date.now());
    // console.log(interactionTimestamps, 'interaction timestamps')

    // You can re-enable and adjust this logic if needed
    // if (interactionTimestamps.length > idleCalctimeinSeconds) {
    //   interactionTimestamps.shift();
    // }
  }
}

const COMMAND_GET_INPUT_DEVICE_EVENT_NUMBER =
  "grep -E 'Handlers|EV=' /proc/bus/input/devices |" +
  "grep -B1 'EV=120013' |" +
  "grep -Eo 'event[0-9]+' |" +
  "grep -Eo '[0-9]+' |" +
  "tr -d '\n'";

function executeCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: "utf-8" });
    return result.trim();
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    process.exit(1);
  }
}

export function getInputDevicePath() {
  const eventNumber = executeCommand(COMMAND_GET_INPUT_DEVICE_EVENT_NUMBER);
  // console.log(eventNumber, "event")
  return `/dev/input/event${eventNumber}`;
}
 let detectionWin;

// Main function to start detection
export function startDetection(detectionType, mainWindow) {
  detectionStatus = true; resetInteractionTimeStampsForActivity();
  let executablePath;
  let filename

  if (process.platform === 'linux') {
    if (detectionType === 'mouse') {
      const mouseCommand = 'cat';
      const args = ['/dev/input/mice'];
      executablePath = spawn(mouseCommand, args);
    } else if (detectionType === 'keyboard') {
      // Adjust this according to your keyboard input detection method
      // For simplicity, let's assume 'cat' on a keyboard device file.
      const keyboardCommand = 'cat';
      const keyboardArgs = getInputDevicePath()
      const args = [keyboardArgs]; // Replace 'eventX' with the appropriate device file for your keyboard.
      executablePath = spawn(keyboardCommand, args);
    } else {
      console.error('Unsupported detection type on Linux.');
      return;
    }
  } else {
    const baseFilename =
      detectionType === 'mouse' ? 'resources/MouseTracker' : 'resources/Keyboardtracker';
    const filenameExtension = process.platform === 'win32' ? '.exe' : '';
    if (process.platform === 'darwin'){
      filename = detectionType === 'mouse' ? 'mousemac' : 'keyboardmac';
    } else {
      filename = `${baseFilename}${filenameExtension}`
    }
   
    executablePath = isPackaged
      ? path.join(process.resourcesPath, 'app.asar.unpacked', `${baseFilename}${filenameExtension}`)
      : `./${filename}`;

      if (!executablePath) {
        console.error('Executable path not found.');
        return;
      }
      checkExecutableExists(executablePath)
    
      
    
      processes[detectionType] = executablePath;
       detectionWin = spawn(executablePath)
      // console.log(detectionWin.stdout)
  }

  
 

if (process.platform === 'linux'){
  executablePath.stdout.on('data', (data) => handleData(data, detectionType, mainWindow));
  executablePath.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    dialog.showErrorBox('Error', `${data}`);
  });
  executablePath.on('close', (code) => {
    console.log(`${detectionType} process exited with code ${code}`);
    delete processes[detectionType]; // Remove the reference once the process has exited
  });

}

  detectionWin.stdout.on('data', (data) => handleData(data, detectionType, mainWindow));
  detectionWin.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    dialog.showErrorBox('Error', `${data}`);
  });
  detectionWin.on('close', (code) => {
    console.log(`${detectionType} process exited with code ${code}`);
    delete processes[detectionType]; // Remove the reference once the process has exited
  });
}

// resetInteractionTimeStampsForActivity();
export function stopDetection(detectionType) {
  console.log("stop function triggered")
  detectionStatus = false;

  let processToKill;

  if (process.platform === 'linux') {
    processToKill = processes[detectionType];
  } else {
    processToKill = detectionWin;
  }

  if (processToKill) {
    processToKill.on('close', (code, signal) => {
      console.log(
        `${detectionType} detection process terminated with code ${code} and signal ${signal}`
      )
      if (process.platform === 'linux') {
        delete processes[detectionType];
      } else {
        detectionWin = null;
      }
    });

    processToKill.kill('SIGTERM');
    console.log(`Termination signal sent to ${detectionType} detection process.`);
  } else {
    console.log(`No active ${detectionType} detection process found.`);
  }
}

