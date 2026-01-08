/**
 * Differential Testing Service
 * 
 * Performs large-scale randomized differential testing between two C++ programs:
 * - Oracle (correct implementation)
 * - Candidate (faulty implementation)
 * 
 * Input Model:
 * - Array-based inputs only
 * - Format: n followed by a1 a2 ... an
 * - Constraints: n ∈ [Nmin, Nmax], ai ∈ [Vmin, Vmax]
 */

import axios from "axios";

// Configuration defaults
const DEFAULT_CONFIG = {
  // Array length constraints
  nMin: 1,
  nMax: 100,
  // Array element value constraints
  vMin: -1000,
  vMax: 1000,
  // Testing budget
  maxTestcases: 1000,
  maxTimeMs: 30000, // 30 seconds total budget
  // Runner service URL
  runnerUrl: "http://localhost:4000",
};

/**
 * Generates a random integer in range [min, max] (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer in [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a single random array testcase
 * @param {object} config - Configuration with nMin, nMax, vMin, vMax
 * @returns {object} Testcase with n, array, and formatted input string
 */
function generateTestcase(config) {
  const { nMin, nMax, vMin, vMax } = config;
  
  // Generate array length
  const n = randomInt(nMin, nMax);
  
  // Generate array elements
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(randomInt(vMin, vMax));
  }
  
  // Format as input string: "n\na1 a2 a3 ... an"
  const inputString = `${n}\n${array.join(" ")}`;
  
  return {
    n,
    array,
    inputString,
  };
}

/**
 * Executes C++ code with given input via runner service
 * @param {string} code - C++ source code
 * @param {string} input - Input string
 * @param {string} runnerUrl - Runner service URL
 * @returns {Promise<object>} Execution result with status and output
 */
async function executeCode(code, input, runnerUrl) {
  try {
    const response = await axios.post(`${runnerUrl}/run`, {
      code,
      input,
    }, {
      timeout: 10000, // 10s timeout per execution
    });
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return { status: "TIMEOUT", error: "Request timeout" };
    }
    return { status: "ERROR", error: error.message };
  }
}

/**
 * Normalizes output for comparison
 * - Trims whitespace
 * - Normalizes line endings
 * - Removes trailing newlines
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
function normalizeOutput(output) {
  if (!output) return "";
  return output
    .replace(/\r\n/g, "\n")  // Normalize line endings
    .trim();                   // Remove leading/trailing whitespace
}

/**
 * Compares outputs from oracle and candidate
 * @param {string} oracleOutput - Output from correct implementation
 * @param {string} candidateOutput - Output from faulty implementation
 * @returns {boolean} True if outputs match, false otherwise
 */
function outputsMatch(oracleOutput, candidateOutput) {
  return normalizeOutput(oracleOutput) === normalizeOutput(candidateOutput);
}

/**
 * Runs a single differential test
 * @param {string} oracleCode - Correct implementation
 * @param {string} candidateCode - Faulty implementation
 * @param {object} testcase - Generated testcase
 * @param {string} runnerUrl - Runner service URL
 * @returns {Promise<object>} Test result
 */
async function runSingleTest(oracleCode, candidateCode, testcase, runnerUrl) {
  // Execute both programs with identical input
  const [oracleResult, candidateResult] = await Promise.all([
    executeCode(oracleCode, testcase.inputString, runnerUrl),
    executeCode(candidateCode, testcase.inputString, runnerUrl),
  ]);
  
  // Check for execution errors
  const oracleOk = oracleResult.status === "OK";
  const candidateOk = candidateResult.status === "OK";
  
  // Determine if this is a failing testcase
  let isFailing = false;
  let failureReason = null;
  
  if (oracleOk && candidateOk) {
    // Both executed successfully - compare outputs
    isFailing = !outputsMatch(oracleResult.output, candidateResult.output);
    if (isFailing) {
      failureReason = "OUTPUT_MISMATCH";
    }
  } else if (oracleOk && !candidateOk) {
    // Oracle succeeded but candidate failed
    isFailing = true;
    failureReason = `CANDIDATE_${candidateResult.status}`;
  } else if (!oracleOk && candidateOk) {
    // Oracle failed but candidate succeeded - unusual, still a mismatch
    isFailing = true;
    failureReason = `ORACLE_${oracleResult.status}`;
  } else {
    // Both failed - only count as failing if different error types
    isFailing = oracleResult.status !== candidateResult.status;
    if (isFailing) {
      failureReason = "DIFFERENT_ERROR_TYPES";
    }
  }
  
  return {
    testcase,
    oracleResult,
    candidateResult,
    isFailing,
    failureReason,
  };
}

/**
 * Main differential testing function
 * 
 * Generates random testcases and compares oracle vs candidate outputs.
 * Returns the smallest failing testcase (by array length n) if found.
 * 
 * @param {object} params - Testing parameters
 * @param {string} params.oracleCode - Correct C++ implementation
 * @param {string} params.candidateCode - Faulty C++ implementation
 * @param {number} [params.nMin] - Minimum array length
 * @param {number} [params.nMax] - Maximum array length
 * @param {number} [params.vMin] - Minimum element value
 * @param {number} [params.vMax] - Maximum element value
 * @param {number} [params.maxTestcases] - Maximum testcases to generate
 * @param {number} [params.maxTimeMs] - Maximum testing time in milliseconds
 * @returns {Promise<object>} Testing result
 */
export async function runDifferentialTest(params) {
  const {
    oracleCode,
    candidateCode,
    nMin = DEFAULT_CONFIG.nMin,
    nMax = DEFAULT_CONFIG.nMax,
    vMin = DEFAULT_CONFIG.vMin,
    vMax = DEFAULT_CONFIG.vMax,
    maxTestcases = DEFAULT_CONFIG.maxTestcases,
    maxTimeMs = DEFAULT_CONFIG.maxTimeMs,
    runnerUrl = DEFAULT_CONFIG.runnerUrl,
  } = params;
  
  // Validate inputs
  if (!oracleCode || !candidateCode) {
    throw new Error("Both oracleCode and candidateCode are required");
  }
  
  if (nMin < 0 || nMax < nMin) {
    throw new Error("Invalid array length constraints: require 0 <= nMin <= nMax");
  }
  
  if (vMax < vMin) {
    throw new Error("Invalid value constraints: require vMin <= vMax");
  }
  
  // Configuration for this test run
  const config = { nMin, nMax, vMin, vMax };
  
  // Tracking variables
  const startTime = Date.now();
  let testedCount = 0;
  let smallestFailingTestcase = null;
  let failingTestcases = [];
  
  // Statistics
  const stats = {
    totalTested: 0,
    totalFailing: 0,
    oracleErrors: 0,
    candidateErrors: 0,
    outputMismatches: 0,
  };
  
  // Main testing loop
  while (testedCount < maxTestcases) {
    // Check time budget
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxTimeMs) {
      break;
    }
    
    // Generate testcase
    const testcase = generateTestcase(config);
    
    // Run differential test
    const result = await runSingleTest(
      oracleCode,
      candidateCode,
      testcase,
      runnerUrl
    );
    
    testedCount++;
    stats.totalTested++;
    
    // Track errors
    if (result.oracleResult.status !== "OK") {
      stats.oracleErrors++;
    }
    if (result.candidateResult.status !== "OK") {
      stats.candidateErrors++;
    }
    
    // Handle failing testcase
    if (result.isFailing) {
      stats.totalFailing++;
      
      if (result.failureReason === "OUTPUT_MISMATCH") {
        stats.outputMismatches++;
      }
      
      // Track this failing testcase
      const failingRecord = {
        n: testcase.n,
        array: testcase.array,
        input: testcase.inputString,
        oracleOutput: result.oracleResult.output || null,
        oracleStatus: result.oracleResult.status,
        candidateOutput: result.candidateResult.output || null,
        candidateStatus: result.candidateResult.status,
        failureReason: result.failureReason,
      };
      
      failingTestcases.push(failingRecord);
      
      // Update smallest if this is smaller
      if (
        smallestFailingTestcase === null ||
        testcase.n < smallestFailingTestcase.n
      ) {
        smallestFailingTestcase = failingRecord;
      }
    }
  }
  
  const totalTimeMs = Date.now() - startTime;
  
  // Build result
  if (smallestFailingTestcase !== null) {
    return {
      status: "FAILING_TESTCASE_FOUND",
      message: `Found ${stats.totalFailing} failing testcase(s). Returning the smallest by array length (n=${smallestFailingTestcase.n}).`,
      smallestFailingTestcase,
      statistics: {
        ...stats,
        totalTimeMs,
        testcasesPerSecond: (stats.totalTested / totalTimeMs * 1000).toFixed(2),
      },
      constraints: {
        nMin,
        nMax,
        vMin,
        vMax,
      },
    };
  } else {
    return {
      status: "NO_FAILING_TESTCASE",
      message: `No failing testcase was found under the tested input space after ${stats.totalTested} testcases.`,
      smallestFailingTestcase: null,
      statistics: {
        ...stats,
        totalTimeMs,
        testcasesPerSecond: (stats.totalTested / totalTimeMs * 1000).toFixed(2),
      },
      constraints: {
        nMin,
        nMax,
        vMin,
        vMax,
      },
      note: "This does NOT guarantee correctness. The system only reports observations within the tested scope.",
    };
  }
}

/**
 * Validates that the oracle code compiles and runs correctly
 * with a simple testcase before starting full differential testing.
 * 
 * @param {string} oracleCode - Oracle C++ code
 * @param {string} runnerUrl - Runner service URL
 * @returns {Promise<object>} Validation result
 */
export async function validateOracle(oracleCode, runnerUrl = DEFAULT_CONFIG.runnerUrl) {
  const simpleTestcase = "1\n0"; // n=1, array=[0]
  const result = await executeCode(oracleCode, simpleTestcase, runnerUrl);
  
  return {
    valid: result.status === "OK",
    status: result.status,
    error: result.error || null,
  };
}

/**
 * Validates that the candidate code compiles correctly
 * (may still have logic errors, which is expected).
 * 
 * @param {string} candidateCode - Candidate C++ code
 * @param {string} runnerUrl - Runner service URL
 * @returns {Promise<object>} Validation result
 */
export async function validateCandidate(candidateCode, runnerUrl = DEFAULT_CONFIG.runnerUrl) {
  const simpleTestcase = "1\n0"; // n=1, array=[0]
  const result = await executeCode(candidateCode, simpleTestcase, runnerUrl);
  
  // Candidate is valid if it at least compiles (CE would indicate invalid code)
  const valid = result.status !== "CE" && result.status !== "ERROR";
  
  return {
    valid,
    status: result.status,
    error: result.error || null,
  };
}

export default {
  runDifferentialTest,
  validateOracle,
  validateCandidate,
};
