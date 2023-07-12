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

// Note:
// In this function specifically, instead of async/await, we are returning a new promise through the Promise constructor. This is done so that we can handle the promise manually and thoroughly. Using async/await would have been a bit more concise, but it would have been harder to handle the errors.

const executeCpp = (filePath, userInput) => {
    // get the job id from the file path
    const jobId = path.basename(filePath).split('.')[0];
    // concatenate the output file path
    const outputFilePath = path.join(outputPath, `${jobId}.out`);


    return new Promise((resolve, reject) => {
        // compile the file and run the executable
        // here, the file paths have been modified according to the Linux OS
        // user input is passed to the executable through stdin
        // exec(`g++ "${filePath}" -o "${outputFilePath}" && cd "${outputPath}" && ${jobId}.exe`,
        exec(`g++ "${filePath}" -o "${outputFilePath}" && cd "${outputPath}" && ./${jobId}.out`,
            (error, stdout, stderr) => {
                // if there is an error, reject the promise
                error && reject({ error, stderr });
                // if there is a stderr, reject the promise
                stderr && reject(stderr);
                // if there is no error, resolve the promise with the output
                console.log(stdout);
                resolve(stdout);
            }
        ).stdin.end(userInput);
    });
};

module.exports = { executeCpp };