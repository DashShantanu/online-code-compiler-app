import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmission = async () => {
    // make an object that contains the code and the language
    const payload = {
      language: "cpp",
      code
    };

    try {
      // send a post request to the server
      const { data } = await axios.post("http://localhost:5000/run", payload);

      setOutput(data.output);
    }
    catch (err) {
      console.log(err);
    }
  };


  return (
    <div className=" m-5">
      <h1 className="text-4xl font-bold">
        Online Code Compiler
      </h1>

      {/* text area */}
      <div className=" mt-6">
        <textarea
          className="border-2 border-gray-500 rounded-lg p-2"
          placeholder="Enter your code here..."
          rows="20"
          cols="90"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
        </textarea>
      </div>

      {/* button */}
      <div className="flex flex-row mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmission}
        >
          Run Code
        </button>
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