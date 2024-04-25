// check-updates.js

const { exec } = require('child_process');

// Run 'npm outdated' command to check for updates
exec('npm outdated --json', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(stdout); // Print the JSON output
});
