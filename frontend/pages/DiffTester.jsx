import { useState } from "react";
import API from "../src/Api";

function DiffTester() {
  // ===== CODE INPUTS =====
  const [oracleCode, setOracleCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int arr[n];
    for(int i = 0; i < n; i++) cin >> arr[i];
    
    // Correct: use long long
    long long sum = 0;
    for(int i = 0; i < n; i++) sum += arr[i];
    cout << sum << endl;
    
    return 0;
}`);

  const [candidateCode, setCandidateCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    int arr[n];
    for(int i = 0; i < n; i++) cin >> arr[i];
    
    // Bug: integer overflow for large values
    int sum = 0;
    for(int i = 0; i < n; i++) sum += arr[i];
    cout << sum << endl;
    
    return 0;
}`);

  // ===== INPUT CONSTRAINTS =====
  const [arrayConstraints, setArrayConstraints] = useState({
    nMin: 1,
    nMax: 100,
    vMin: -1000,
    vMax: 1000,
  });

  // ===== TESTING BUDGET =====
  const [testingBudget, setTestingBudget] = useState({
    maxTestcases: 500,
    maxTimeMs: 30000,
  });

  // ===== RESULTS =====
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  // ===== HANDLERS =====

  function handleArrayConstraintChange(field, value) {
    setArrayConstraints({
      ...arrayConstraints,
      [field]: Number(value),
    });
  }

  function handleBudgetChange(field, value) {
    setTestingBudget({
      ...testingBudget,
      [field]: Number(value),
    });
  }

  function buildRequestBody() {
    return {
      oracleCode,
      candidateCode,
      nMin: arrayConstraints.nMin,
      nMax: arrayConstraints.nMax,
      vMin: arrayConstraints.vMin,
      vMax: arrayConstraints.vMax,
      maxTestcases: testingBudget.maxTestcases,
      maxTimeMs: testingBudget.maxTimeMs,
    };
  }

  function handleRunTest() {
    setTesting(true);
    setResult(null);
    setError("");

    const requestBody = buildRequestBody();
    console.log("Sending request:", requestBody);

    API.post("/differential/test", requestBody)
      .then(function (response) {
        console.log("Test result:", response.data);
        setTesting(false);
        setResult(response.data);
      })
      .catch(function (err) {
        console.log("Test failed:", err);
        setTesting(false);
        setError(err.response?.data?.error || err.message || "Test failed");
      });
  }

  // ===== RENDER =====
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Code Debugger (Differential Testing)</h1>
      <p>Find bugs by comparing your code against a correct solution.</p>

      {/* ===== CODE EDITORS ===== */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Oracle (Correct Solution)</h3>
          <textarea
            value={oracleCode}
            onChange={(e) => setOracleCode(e.target.value)}
            rows={15}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "10px",
              backgroundColor: "#1e1e1e",
              color: "#00ff00",
              border: "2px solid #4CAF50",
              borderRadius: "5px",
            }}
            disabled={testing}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h3>Candidate (Your Solution)</h3>
          <textarea
            value={candidateCode}
            onChange={(e) => setCandidateCode(e.target.value)}
            rows={15}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "10px",
              backgroundColor: "#1e1e1e",
              color: "#ff6b6b",
              border: "2px solid #f44336",
              borderRadius: "5px",
            }}
            disabled={testing}
          />
        </div>
      </div>

      {/* ===== ARRAY CONSTRAINTS ===== */}
      <div style={{ 
        backgroundColor: "#f5f5f5", 
        padding: "15px", 
        borderRadius: "8px",
        marginBottom: "20px" 
      }}>
        <h3 style={{ marginTop: 0 }}>Array Input Constraints</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Input format: n (array length), followed by n space-separated integers
        </p>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <label>Min Length (nMin): </label>
            <input
              type="number"
              value={arrayConstraints.nMin}
              onChange={(e) => handleArrayConstraintChange("nMin", e.target.value)}
              min={0}
              disabled={testing}
              style={{ width: "80px", padding: "5px" }}
            />
          </div>

          <div>
            <label>Max Length (nMax): </label>
            <input
              type="number"
              value={arrayConstraints.nMax}
              onChange={(e) => handleArrayConstraintChange("nMax", e.target.value)}
              min={1}
              disabled={testing}
              style={{ width: "80px", padding: "5px" }}
            />
          </div>

          <div>
            <label>Min Value (vMin): </label>
            <input
              type="number"
              value={arrayConstraints.vMin}
              onChange={(e) => handleArrayConstraintChange("vMin", e.target.value)}
              disabled={testing}
              style={{ width: "100px", padding: "5px" }}
            />
          </div>

          <div>
            <label>Max Value (vMax): </label>
            <input
              type="number"
              value={arrayConstraints.vMax}
              onChange={(e) => handleArrayConstraintChange("vMax", e.target.value)}
              disabled={testing}
              style={{ width: "100px", padding: "5px" }}
            />
          </div>
        </div>
      </div>

      {/* ===== TESTING BUDGET ===== */}
      <div style={{ 
        backgroundColor: "#e3f2fd", 
        padding: "15px", 
        borderRadius: "8px",
        marginBottom: "20px" 
      }}>
        <h3 style={{ marginTop: 0 }}>Testing Budget</h3>

        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <label>Max Testcases: </label>
            <input
              type="number"
              value={testingBudget.maxTestcases}
              onChange={(e) => handleBudgetChange("maxTestcases", e.target.value)}
              min={1}
              max={10000}
              disabled={testing}
              style={{ width: "100px", padding: "5px" }}
            />
          </div>

          <div>
            <label>Max Time (ms): </label>
            <input
              type="number"
              value={testingBudget.maxTimeMs}
              onChange={(e) => handleBudgetChange("maxTimeMs", e.target.value)}
              min={1000}
              max={120000}
              step={1000}
              disabled={testing}
              style={{ width: "100px", padding: "5px" }}
            />
          </div>
        </div>
      </div>

      {/* ===== RUN BUTTON ===== */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleRunTest}
          disabled={testing}
          style={{
            padding: "15px 40px",
            fontSize: "18px",
            backgroundColor: testing ? "#999" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: testing ? "not-allowed" : "pointer",
          }}
        >
          {testing ? "⏳ Testing..." : "🐛 Find Bug"}
        </button>
      </div>

      {/* ===== ERROR DISPLAY ===== */}
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          border: "2px solid #f44336",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
        }}>
          <h3 style={{ color: "#d32f2f", marginTop: 0 }}>❌ Error</h3>
          <p style={{ color: "#d32f2f", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* ===== RESULTS DISPLAY ===== */}
      {result && (
        <div style={{
          backgroundColor: result.status === "FAILING_TESTCASE_FOUND" ? "#ffebee" : "#e8f5e9",
          border: result.status === "FAILING_TESTCASE_FOUND" ? "2px solid #f44336" : "2px solid #4CAF50",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <h2 style={{ marginTop: 0 }}>
            {result.status === "FAILING_TESTCASE_FOUND" 
              ? "🐛 Bug Found!" 
              : "✅ All Tests Passed!"}
          </h2>

          {/* Message */}
          <p style={{ fontSize: "16px" }}>{result.message}</p>

          {/* Statistics */}
          {result.statistics && (
            <div style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}>
              <h4 style={{ marginTop: 0 }}>📊 Statistics</h4>
              <p><strong>Total Tested:</strong> {result.statistics.totalTested}</p>
              <p><strong>Total Failing:</strong> {result.statistics.totalFailing}</p>
              <p><strong>Time Taken:</strong> {result.statistics.totalTimeMs}ms</p>
              <p><strong>Speed:</strong> {result.statistics.testcasesPerSecond} tests/sec</p>
            </div>
          )}

          {/* Failing Testcase */}
          {result.smallestFailingTestcase && (
            <div style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "5px",
            }}>
              <h4 style={{ marginTop: 0 }}>🔍 Smallest Failing Testcase</h4>

              <p><strong>Array Length (n):</strong> {result.smallestFailingTestcase.n}</p>

              <div style={{ marginBottom: "15px" }}>
                <strong>Input:</strong>
                <pre style={{
                  backgroundColor: "#263238",
                  color: "#ffffff",
                  padding: "15px",
                  borderRadius: "5px",
                  overflow: "auto",
                  fontFamily: "monospace",
                }}>
                  {result.smallestFailingTestcase.input || "N/A"}
                </pre>
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <strong>Oracle Output (Expected):</strong>
                  <pre style={{
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "15px",
                    borderRadius: "5px",
                    border: "2px solid #4CAF50",
                    fontFamily: "monospace",
                  }}>
                    {result.smallestFailingTestcase.oracleOutput || "N/A"}
                  </pre>
                </div>

                <div style={{ flex: 1 }}>
                  <strong>Candidate Output (Actual):</strong>
                  <pre style={{
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    padding: "15px",
                    borderRadius: "5px",
                    border: "2px solid #f44336",
                    fontFamily: "monospace",
                  }}>
                    {result.smallestFailingTestcase.candidateOutput || "N/A"}
                  </pre>
                </div>
              </div>

              <p style={{ marginTop: "15px" }}>
                <strong>Failure Reason:</strong>{" "}
                <span style={{ color: "#d32f2f" }}>
                  {result.smallestFailingTestcase.failureReason || "Output mismatch"}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== DEBUG: Show raw response ===== */}
      {result && (
        <details style={{ marginTop: "20px" }}>
          <summary style={{ cursor: "pointer" }}>🔧 Debug: Raw Response</summary>
          <pre style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            overflow: "auto",
            fontSize: "12px",
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default DiffTester;