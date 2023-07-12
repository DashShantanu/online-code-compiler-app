const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { generateFile } = require('./generateFile');
const { addJobToQueue } = require('./jobQueue');
const Job = require('./models/Job');

// connect to the database
// mongoose.connect no longer accepts a callback
// instead you need to use the new async/await syntax or promises
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://papun260801:dN5bbT0VyaFTOj0o@cluster-code-dash.rehgrfl.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        // console.log('Connected to mongodb database!');
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

app.get('/status', async (req, res) => {
    // get the job id from the query string
    const jobId = req.query.id;
    // check if the job id is empty, if so, return status 400 (bad request)
    if (!jobId) {
        return res.status(400)
            .json({ success: false, error: 'missing id query param' })
    }

    // find the job in the database
    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404)
                .json({ success: false, error: 'Invalid job id!' });
        }
        // return the job in json format
        res.setHeader('Content-Type', 'application/json');
        return res.json({ success: true, job });
    }
    catch (err) {
        return res.status(400)
            .json({ success: false, error: JSON.stringify(err) });
    }

});

app.post('/run', async (req, res) => {
    // destructure the language and code properties from the request body
    const { language = 'cpp', code, userInput } = req.body;
    // check if code is empty, if so, return status 400 (bad request)
    if (!code) {
        return res.status(400)
            .json({ success: false, error: 'Empty code body!' })
    }

    console.log("request fetched");
    let job;
    try {
        // need to generate a c++/python file with the content from the request
        const filePath = await generateFile(language, code);

        // create a new job in the database
        job = await new Job({ language, filePath }).save();
        const jobId = job['_id'];

        console.log("job created");

        // add the job to the queue
        addJobToQueue(jobId, userInput);

        console.log("job added to queue");

        // return the job id in json format
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ success: true, jobId });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: JSON.stringify(err) });
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}!`);
});