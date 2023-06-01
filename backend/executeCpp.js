// The child_process module in Node.js provides functionality for spawning child processes, enabling communication with them, and controlling their execution. It allows you to run external commands or scripts from your Node.js application and interact with them programmatically.
const { exec } = require('child_process');

// store the path to the directory where the generated outputs will be stored
const path = require('path');
const fs = require('fs');
const outputPath = path.join(__dirname, 'outputs');

// check if the directory exists, if not, create it
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filePath) => {
    // get the job id from the file path
    const jobId = path.basename(filePath).split('.')[0];
    // concatenate the output file path
    const outputFilePath = path.join(outputPath, `${jobId}.exe`);

    return new Promise((resolve, reject) => {
        // compile the file and run the executable
        // here, the file paths have been modified according to the Windows OS
        exec(`g++ "${filePath}" -o "${outputFilePath}" && cd "${outputPath}" && ${jobId}.exe`,
            (error, stdout, stderr) => {
                // if there is an error, reject the promise
                error && reject({ error, stderr });
                // if there is a stderr, reject the promise
                stderr && reject(stderr);
                // if there is no error, resolve the promise with the output
                resolve(stdout);
            });
    });
};

module.exports = { executeCpp };