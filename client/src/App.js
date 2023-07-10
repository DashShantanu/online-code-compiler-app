import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stubs from './defaultStubs';
import moment from 'moment';
// import { set } from 'mongoose';

// Import Brace and the AceEditor Component
// import brace from 'brace';
import AceEditor from 'react-ace';

// Import a Mode (language)
import 'brace/mode/python';
import 'brace/mode/c_cpp';
// Import a Theme (okadia, github, xcode etc)
import 'brace/theme/github';
import 'brace/theme/monokai';

const App = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [userInput, setUserInput] = useState("");

  // get the default language from the local storage
  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  // set the default code for the selected language
  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  // set the default language in the local storage
  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
  };

  // render the time details
  const renderTimeDetails = () => {
    if (!jobDetails) return "";

    let result = "";
    // get the startedAt and completedAt from the jobDetails object
    const { startedAt, completedAt } = jobDetails;

    // let submitted = moment(submittedAt).toString();
    // result += `Submitted at: ${submitted}\n`;

    // if the job is still pending, then return the result
    if (!completedAt || !startedAt) return result;

    // if the job is completed, then calculate the execution time
    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, 'seconds', true);

    result += `Execution time: ${executionTime}s`;

    return result;
  }

  const updateCode = (newValue) => {
    setCode(newValue);
  };

  const handleSubmission = async () => {
    // make an object that contains the code and the language
    const payload = {
      language,
      code,
      userInput
    };

    try {
      // reset the output, status and jobId everytime the user submits a new job
      setJobId("");
      setStatus("");
      setOutput(``);
      setJobDetails(null);

      // send a post request to the server
      const { data } = await axios.post("http://localhost:5000/run", payload);
      console.log(data);
      setJobId(data.jobId);

      let intervalId = setInterval(async () => {
        // send a get request to the server to get the status of the job
        const { data: dataRes } = await axios.get(`http://localhost:5000/status`, { params: { id: data.jobId } });

        const { success, job, error } = dataRes;
        console.log(dataRes);

        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);

          if (jobStatus === 'pending') return;

          setOutput(jobOutput);
          clearInterval(intervalId);

        } else {
          clearInterval(intervalId);
          setStatus('Error: Please try again!');
          setOutput(error);
        }

        console.log(dataRes);

      }, 1000);
    }
    catch ({ response }) {
      if (response) {
        const errorMessage = response.data.err.stderr;
        setOutput(errorMessage);
      }
      else {
        setOutput("Error connecting to server!");
      }
    }
  };


  return (
    <div className=" m-5">
      <h1 className="text-4xl font-bold">
        Online Code Compiler
      </h1>

      {/* language selector dropdown */}
      <div className="mt-6">
        <label className="mr-2">Select Language:</label>
        <select
          className="border-2 border-gray-500 rounded-lg p-2"
          value={language}
          onChange={(e) => {
            let response = window.confirm("WARNING: Switching the language will reset the current code. Do you wish to proceed?");

            // if the user clicks ok, then set the language
            response && setLanguage(e.target.value);
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>

      {/* Set default button */}
      <div className="mt-6">
        <button
          className="hover:bg-blue-500 hover:border-2 hover:border-white-500 hover:text-white py-2 px-4 rounded border-2 border-gray-500"
          onClick={setDefaultLanguage}
        >
          Set Default Language
        </button>
      </div>

      {/* Editor text area */}
      <AceEditor
        mode="c_cpp"
        theme="monokai"
        value={code}
        onChange={updateCode}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{
          $blockScrolling: true
        }}
        fontSize={20}
        width="55%"
      />

      {/* button */}
      <div className="flex flex-row mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmission}
        >
          Run Code
        </button>
      </div>

      {/* User input */}
      <div className="mt-6">
        <div className="mr-2">Input:</div>
        <textarea
          className="border-2 border-gray-500 rounded-lg p-2"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </div>

      {/* Execution details */}
      <div className="mt-6">
        <h1 className="text-2xl">
          {status}
        </h1>
      </div>
      <div className="mt-6">
        <h1 className="text-2xl">
          {jobId && `Job ID: ${jobId}`}
        </h1>
      </div>
      <div className="mt-6">
        <h1 className="text-2xl">
          {renderTimeDetails()}
        </h1>
      </div>

      {/* Output */}
      <div className="mt-6">
        <h1 className="text-2xl">
          {output}
        </h1>
      </div>

    </div>
  );
};

export default App;