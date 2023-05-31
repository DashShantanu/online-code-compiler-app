const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

// path to the directory where the generated files will be stored
// path.join gives cross platform compatibility
const dirCodes = path.join(__dirname, 'codes');

// check if the directory exists, if not, create it
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (format, code) => {
    // generate a unique id for the file and concatenate the file extension
    const jobId = uuid();
    const fileName = `${jobId}.${format}`;
    const filePath = path.join(dirCodes, fileName);

    // write the file to the disk
    await fs.writeFileSync(filePath, code);

    return filePath;
};

module.exports = { generateFile };