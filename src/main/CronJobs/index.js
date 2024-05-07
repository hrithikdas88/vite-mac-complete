import { desktopCapturer, screen, Notification, dialog } from 'electron';
import { exec } from 'child_process'
import fs from "fs"
import path from 'path';



// screenshot logic for win and mac
async function captureScreen() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const options = {
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 },
    fetchWindowIcons: false,
    screen: { id: primaryDisplay.id },
  };
  const sources = await desktopCapturer.getSources(options);
  return sources[0].thumbnail;
}

export default async function takeScreenshot() {
  try {
    const screenShotInfo = await captureScreen();
    const dataURL = screenShotInfo.toDataURL();
    const notification = new Notification({
      title: 'Screenshot Taken',
      body: 'Screenshot has been captured successfully',
    });
    notification.show();
    return dataURL;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
}

export function takeScreenshotLinux() {
  console.log("screenshot execution")
  const screenshotName =   `screenshot${Date.now()}.png`;

  exec(`gnome-screenshot -d 2 -f "${screenshotName}"`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);

      fs.readFile(screenshotName, (err, data) => {
          if (err) {
              console.error(`Error reading file: ${err}`);
              // dialog.showErrorBox("error", "screenshot not found")
              return;
          }

          console.log('Screenshot data loaded, file size:', data.length);

          const notification = new Notification({
              title: "Screenshot Taken",
              body: "Screenshot has been captured successfully",
          });
          notification.show();
      });
  });
}

