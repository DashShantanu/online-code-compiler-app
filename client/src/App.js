import React, { useState, useEffect } from 'react';
import axios from 'axios';
import stubs from './defaultStubs';
import moment from 'moment';
// import { set } from 'mongoose';

// Import the AceEditor Component
import AceEditor from 'react-ace';

// Import a Mode (language)
// import "ace-builds/src-noconflict/mode-c_cpp";
import 'brace/mode/c_cpp';
import "ace-builds/src-noconflict/mode-python";

import "ace-builds/src-noconflict/ext-language_tools";

// Import Themes (okadia, github, xcode etc)
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-dreamweaver";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-kuroir";


const App = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [editorTheme, setEditorTheme] = useState("twilight");
  const [editorFontSize, setEditorFontSize] = useState(20);

  // object mapping of supported languages to modes
  const modes = {
    "cpp": "c_cpp",
    "python": "python"
  };

  // list of supported themes
  const themes = ["twilight", "monokai", "one_dark", "terminal", "xcode", "dracula", "dreamweaver", "solarized_dark", "solarized_light", "kuroir"];

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
      const { data } = await axios.post("https://code-dash-server.netlify.app:5000/run", payload);
      console.log(jobId);
      setJobId(data.jobId);

      let intervalId = setInterval(async () => {
        // send a get request to the server to get the status of the job
        const { data: dataRes } = await axios.get(`https://code-dash-server.netlify.app:5000/status`, { params: { id: data.jobId } });

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
    <div className=" bg-slate-900 w-full h-[100vh] p-6">
      <h1 className="text-4xl font-bold text-white">
        Online Code Compiler
      </h1>

      {/* Settings Row */}
      <div className="flex flex-row gap-2 mt-6">

        {/* Theme selector dropdown */}
        <div className="mt-6">
          <select
            className="border-2 border-gray-500 p-2 bg-transparent text-white"
            value={editorTheme}
            onChange={(e) => { setEditorTheme(e.target.value); }}
          >
            {
              // map over the themes array and render the options
              themes.map((theme, idx) => {
                return (
                  <option
                    key={idx}
                    value={theme}
                    className=' bg-slate-900 text-white'
                  >
                    {
                      // convert the theme name to title case
                      theme.split('_').map((word) => {
                        return word.charAt(0).toUpperCase() + word.slice(1);
                      }).join(' ')
                    }
                  </option>
                )
              })
            }
          </select>
        </div>


        {/* language selector dropdown */}
        <div className="mt-6">
          <select
            className="border-2 border-gray-500 p-2 text-white bg-transparent"
            value={language}
            onChange={(e) => {
              let response = window.confirm("WARNING: Switching the language will reset the current code. Do you wish to proceed?");

              // if the user clicks ok, then set the language
              response && setLanguage(e.target.value);
            }}
          >
            <option
              value="cpp"
              className=' bg-slate-900 text-white'
            >
              C/C++
            </option>
            <option
              value="py"
              className=' bg-slate-900 text-white'
            >
              Python
            </option>
          </select>
        </div>

        {/* Set default language button */}
        <div className="mt-6">
          <button
            className="hover:bg-blue-500 hover:border-2 hover:border-white-500 hover:text-white py-2 px-4 rounded border-2 border-gray-500 text-white"
            onClick={setDefaultLanguage}
          >
            Set Default Language
          </button>
        </div>

        {/* slider for font size */}
        <div className="mt-6">
          <div className="text-white">
            Font Size: {editorFontSize}px
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step={2}
            value={editorFontSize}
            onChange={(e) => { setEditorFontSize(parseInt(e.target.value)); }}
            className="slider"
          />
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
      <div className="flex flex-row mt-6 gap-1 w-90%">

        {/* Editor text area */}
        <AceEditor
          mode={modes[language]}
          theme={editorTheme}
          value={code}
          onChange={updateCode}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{
            $blockScrolling: true
          }}
          width='70%'
          height='800px'
          fontSize={editorFontSize}
          wrapEnabled={true}
          showPrintMargin={false}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          }}
        />


        {/* Input and Output container */}
        <div className="flex flex-col p-3 io-box">

          {/* User input */}
          <div className="flex flex-col basis-2/5 border-[1px] border-solid border-gray-500">
            <div className=" font-mono p-2 px-4 font-bold text-2xl text-white border-b-gray-500 border-b-[1px]">
              Input
            </div>
            <textarea
              className="border-none mx-2 p-2 bg-transparent resize-none font-mono font-bold text-white text-xl outline-none"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={10}
              cols={60}
            >
            </textarea>
          </div>

          {/* Output */}
          <div className="flex flex-col basis-2/5 border-[1px] border-solid border-gray-500">
            <div className="font-mono p-2 px-4 font-bold text-2xl text-white border-b-gray-500 border-b-[1px]">
              Output
            </div>
            {output &&
              <textarea
                className="border-none mx-2 p-2 bg-transparent resize-none font-mono font-bold text-white text-xl outline-none"
                value={output}
                rows={10}
                cols={50}
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