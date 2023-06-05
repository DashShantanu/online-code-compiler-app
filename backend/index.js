const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { generateFile } = require('./generateFile');
const { executeCpp } = require('./executeCpp');
const { executePy } = require('./executePy');
const Job = require('./models/Job');

// connect to the database
// mongoose.connect no longer accepts a callback
// instead you need to use the new async/await syntax or promises
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/compilerapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to mongodb database!');
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();

// create an express app
const app = express();

// adds middleware to the express app to enable CORS with various options
app.use(cors());

// adds middleware to the Express application (app object) to parse URL-encoded data from incoming requests
app.use(express.urlencoded({ extended: true }));
// middleware to the Express application to parse JSON data from incoming requests
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ message: 'Hello World!' });
});

app.post('/run', async (req, res) => {
    // destructure the language and code properties from the request body
    const { language = 'cpp', code } = req.body;
    // check if code is empty, if so, return status 400 (bad request)
    if (!code) {
        return res.status(400)
            .json({ success: false, error: 'Empty code body!' })
    }

    let job;
    try {
        // need to generate a c++/python file with the content from the request
        const filePath = await generateFile(language, code);

        // create a new job in the database
        job = await new Job({ language, filePath }).save();
        const jobId = job['_id'];

        res.status(201).json({ success: true, jobId });

        // then execute it and send the response back
        let codeOutput = '';

        // set startedAt to current time
        job['startedAt'] = new Date();

        if (language === 'py')
            codeOutput = await executePy(`${filePath}`);
        else if (language === 'cpp')
            codeOutput = await executeCpp(`${filePath}`);

        // set completedAt to current time, job status to success and output to codeOutput
        job['completedAt'] = new Date();
        job['status'] = 'success';
        job['output'] = codeOutput;

        // save the job in the database
        await job.save();

        // return the output in json format
        // return res.json({ output: codeOutput });
    }
    catch (err) {
        // set completedAt to current time, job status to error and output to err
        job['completedAt'] = new Date();
        job['status'] = 'error';
        job['output'] = JSON.stringify(err);

        // save the job in the database
        await job.save();

        // return res.status(500).json({ err });
    };
});

app.listen(5000, () => {
    console.log('Server is listening on port 5000!');
});