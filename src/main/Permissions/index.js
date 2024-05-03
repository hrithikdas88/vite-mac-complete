import { getInputDevicePath } from "../InputDetection";
import sudoPrompt from "sudo-prompt"
import fs from "fs"




function checkPermissions(filePath, callback) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error('Error accessing file:', err);
      return callback(false);
    }
    // Check if others have read permission
    const hasPermission = (stats.mode & 0o004) === 0o004;
    callback(hasPermission);
  });
}


export function GivePermission() {
  const mouseFile = '/dev/input/mice';
  const keyboardFile = getInputDevicePath(); // Ensure this function is correctly defined to get the keyboard device path

  checkPermissions(mouseFile, (mouseHasPermission) => {
    checkPermissions(keyboardFile, (keyboardHasPermission) => {
      let command = '';

      if (!mouseHasPermission) {
        command += `chmod a+r ${mouseFile}`;
      }
      if (!keyboardHasPermission) {
        command += (command ? ' && ' : '') + `chmod a+r ${keyboardFile}`;
      }

      if (command) {
        sudoPrompt.exec(command, { name: 'Your Electron App' }, (error, stdout, stderr) => {
          if (error) {
            console.error('Error:', error);
            return;
          }
          if (stderr) {
            console.error('Stderr:', stderr);
            return;
          }
          console.log('Permissions updated:', stdout);
        });
      } else {
        console.log('No permission changes needed.');
      }
    });
  });

}