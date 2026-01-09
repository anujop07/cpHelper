import { useState } from "react";
import API from "../src/Api";

function CodeRunner() {
  // State for code input
 const [code, setCode] = useState(() => {
  return localStorage.getItem("codeRunnerCode") || `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << "You entered: " << n << endl;
    return 0;
}`;
});


  // State for stdin input
  const [input, setInput] = useState("");

  // State for output
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  // State for loading
  const [running, setRunning] = useState(false);

  // Run the code
  function handleRunCode() {
    setRunning(true);
    setOutput("");
    setStatus("");

    // Call the runner API
    API.post("/run", {
      code: code,
      input: input,
    })
      .then(function (response) {
        console.log("Run result:", response.data);
        setRunning(false);
        setStatus(response.data.status);
        setOutput(response.data.output || response.data.error || "No output");
        console.log("Output set to:", response.data.output);
      })
      .catch(function (err) {
        console.log("Run failed:", err);
        setRunning(false);
        setStatus("ERROR");
        setOutput(err.response?.data?.message || "Failed to run code");
      });
  }

  return (
    <div>
      <h1>Code Runner</h1>
      <p>Write your C++ code and run it!</p>

      {/* Code Editor */}
      <div>
        <h3>Code</h3>
        <textarea
          value={code}
          onChange={(e) => {
  const newCode = e.target.value;
  setCode(newCode);
  localStorage.setItem("codeRunnerCode", newCode);
}}
          rows={20}
          cols={80}
          placeholder="Write your C++ code here..."
          disabled={running}
          style={{ fontFamily: "monospace" }}
        />
      </div>

      {/* Input Section */}
      <div>
        <h3>Input (stdin)</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          cols={80}
          placeholder="Enter input for your program..."
          disabled={running}
          style={{ fontFamily: "monospace" }}
        />
      </div>

      {/* Run Button */}
      <div>
        <button onClick={handleRunCode} disabled={running}>
          {running ? "Running..." : "Run Code"}
        </button>
      </div>

      {/* Output Section */}
      <div>
        <h3>Output</h3>
        {status && (
          <p>
            <strong>Status: </strong>
            <span style={{ color: status === "OK" ? "green" : "red" }}>
              {status}
            </span>
          </p>
        )}
        <pre
          style={{
            backgroundColor: "#111827", 
            color: "#e5e7eb", 
            padding: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            minHeight: "80px",
            borderRadius: "6px",
          }}
        >
          {output !== "" ? output : "Output will appear here..."}
        </pre>
      </div>
    </div>
  );
}

export default CodeRunner;
