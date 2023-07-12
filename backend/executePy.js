// The child_process module in Node.js provides functionality for spawning child processes, enabling communication with them, and controlling their execution. It allows you to run external commands or scripts from your Node.js application and interact with them programmatically.
const { exec } = require('child_process');
const path = require('path');

const executePy = (filePath, userInput) => {
    // get the job id from the file path
    const jobId = path.basename(filePath).split('.')[0];

    return new Promise((resolve, reject) => {
        // Run the python script
        // here, the file paths have been modified according to the Windows OS
        exec(`python "${filePath}"`,
            (error, stdout, stderr) => {
                // if there is an error, reject the promise
                error && reject({ error, stderr });
                // if there is a stderr, reject the promise
                stderr && reject(stderr);
                // if there is no error, resolve the promise with the output
                resolve(stdout);
            }
        ).stdin.end(userInput);
    });
};

module.exports = { executePy };