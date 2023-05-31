const express = require('express');

const app = express();

// adds middleware to the Express application (app object) to parse URL-encoded data from incoming requests
app.use(express.urlencoded({ extended: true }));
// middleware to the Express application to parse JSON data from incoming requests
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ message: 'Hello World!' });
});

app.post('/run', (req, res) => {
    // destructure the language and code properties from the request body
    const { language = 'cpp', code } = req.body;

    // check if code is empty, if so, return status 400 (bad request)
    if (!code) {
        return res.status(400)
            .json({ success: false, error: 'Empty code body!' })
    }

    // need to generate a c++ file with the content from the request
    // then compile the file and run it and send the response back

    return res.json({ language, code });
});

app.listen(5000, () => {
    console.log('Server is listening on port 5000!');
});