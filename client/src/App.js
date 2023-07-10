import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stubs from './defaultStubs';
import moment from 'moment';
// import { set } from 'mongoose';

// Import the AceEditor Component
import AceEditor from 'react-ace';

// Import a Mode (language)
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";

// Import a Theme (okadia, github, xcode etc)
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

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

    result += `${executionTime}s`;

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
      console.log(jobId);
      setJobId(data.jobId);

      let intervalId = setInterval(async () => {
        // send a get request to the server to get the status of the job
        const { data: dataRes } = await axios.get(`http://localhost:5000/status`, { params: { id: data.jobId } });

        const { success, job } = dataRes;
        // console.log(dataRes);

        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);

          if (jobStatus === 'pending') return;

          if (jobStatus === 'error') {
            let errorOutput = JSON.parse(jobOutput);
            let error = errorOutput.stderr;
            // console.log(error);
            setOutput(error);
            setStatus('Error: Please try again!');
            clearInterval(intervalId);
          }
          else {
            setOutput(jobOutput);
            clearInterval(intervalId);
          }

        } else {
          clearInterval(intervalId);
          setStatus('Error: Please try again!');
          setOutput('');
        }

        console.log(dataRes);

      }, 1000);
    }
    catch ({ response }) {
      if (response) {
        const errorMessage = response.data.err.stderr;
        // console.log(response);
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

      {/* Settings Row */}
      <div className="flex flex-row gap-2 mt-6">

        {/* language selector dropdown */}
        <div className="mt-6">
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

        {/* Set default language button */}
        <div className="mt-6">
          <button
            className="hover:bg-blue-500 hover:border-2 hover:border-white-500 hover:text-white py-2 px-4 rounded border-2 border-gray-500"
            onClick={setDefaultLanguage}
          >
            Set Default Language
          </button>
        </div>

        {/* Submit button */}
        <div className="flex flex-row mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmission}
          >
            Run Code
          </button>
        </div>

      </div>


      {/* Editor and input-output container */}
      <div className="flex flex-row mt-6 gap-1 w-80%">

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
          width='60%'
          height='700px'
          fontSize={20}
          wrapEnabled={true}
          showPrintMargin={false}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          }}
        />


        {/* Input and Output container */}
        <div className="flex flex-col bg-[#272822]">

          {/* User input */}
          <div className="flex flex-col basis-2/5 mt-6">
            <div className=" font-mono mr-2 font-bold text-xl text-white">
              Input
            </div>
            <textarea
              className="border-none p-2 bg-[#272822] resize-none font-mono font-bold text-white"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={10}
              cols={80}
            >
            </textarea>
          </div>

          {/* Output */}
          <div className="flex flex-col basis-2/5 mt-6">
            <div className="font-mono mr-2 font-bold text-xl text-white">
              Output
            </div>
            {output &&
              <textarea
                className="border-none p-2 bg-[#272822] resize-none font-mono font-bold text-white"
                value={output}
                rows={10}
                cols={80}
                readOnly
              >
              </textarea>
            }
          </div>

          {/* Execution details */}
          <div className="mt-6">
            <h1 className="font-mono font-bold text-xl text-white">
              Status: {status}
            </h1>
          </div>
          <div className="">
            <h1 className="font-mono font-bold text-xl text-white">
              Execution Time: {renderTimeDetails()}
            </h1>
          </div>

        </div>
      </div>
    </div >
  );
};

export default App;