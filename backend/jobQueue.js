const Queue = require('bull');

// create a new job queue
const jobQueue = new Queue('job-queue');

// number of workers to process the queue
const NUM_WORKERS = 5;

// import the Job model
const Job = require('./models/Job');
// import the executePy and executeCpp functions
const { executePy } = require('./executePy');
const { executeCpp } = require('./executeCpp');

// process jobs from the queue
jobQueue.process(NUM_WORKERS, async ({ data }) => {
    const { id: jobId, userInput } = data;

    // find the job in the database
    const job = await Job.findById(jobId);
    if (!job) {
        throw Error('Job not found!');
    }

    // listen for job failed events and log the error
    jobQueue.on('failed', (error) => {
        console.log(error.data.id, 'failed', error.failedReason);
    });

    // execute the code
    let codeOutput = '';
    try {
        // set startedAt to current time
        job['startedAt'] = new Date();

        if (job.language === 'py')
            codeOutput = await executePy(`${job.filePath}`, userInput);
        else if (job.language === 'cpp')
            codeOutput = await executeCpp(`${job.filePath}`, userInput);

        // set completedAt to current time, job status to success and output to codeOutput
        job['completedAt'] = new Date();
        job['status'] = 'success';
        job['output'] = codeOutput;

        // save the job in the database
        await job.save();
    }
    catch (err) {
        // set completedAt to current time, job status to error and output to err
        job['completedAt'] = new Date();
        job['status'] = 'error';
        job['output'] = JSON.stringify(err);

        // save the job in the database
        await job.save();
    };

});

// add a job to the queue
const addJobToQueue = async (jobId, userInput) => {
    await jobQueue.add({ id: jobId, userInput });
};

module.exports = { addJobToQueue };