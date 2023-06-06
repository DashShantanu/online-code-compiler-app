const mongoose = require('mongoose');

// create a schema for the job
const JobSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: ['cpp', 'py']
    },
    filePath: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    output: {
        type: String
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'error']
    }
});

// a mongoose model is a wrapper on the mongoose schema
// create a model for the job
const Job = new mongoose.model('job', JobSchema);

// export the model
module.exports = Job;