/**
 * Batch Differential Testing Service
 * 
 * Optimized version that leverages the runner's batch endpoint
 * for higher throughput differential testing.
 * 
 * Key optimizations:
 * - Compiles code once per session
 * - Sends multiple testcases in batches
 * - Reduces HTTP overhead
 */

import axios from "axios";

// Configuration
const DEFAULT_CONFIG = {
  nMin: 1,
  nMax: 100,
  vMin: -1000,
  vMax: 1000,
  maxTestcases: 1000,
  maxTimeMs: 30000,
  batchSize: 50, // Testcases per batch request
  runnerUrl: "http://localhost:4000",
};

/**
 * Generates a random integer in range [min, max] (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates multiple testcases
 */
function generateTestcases(count, config) {
  const { nMin, nMax, vMin, vMax } = config;
  const testcases = [];
  
  for (let i = 0; i < count; i++) {
    const n = randomInt(nMin, nMax);
    const array = [];
    for (let j = 0; j < n; j++) {
      array.push(randomInt(vMin, vMax));
    }
    
    testcases.push({
      n,
      array,
      inputString: `${n}\n${array.join(" ")}`,
    });
  }
  
  return testcases;
}

/**
 * Runs batch differential testing via the runner's batch endpoint
 */
async function runBatch(oracleCode, candidateCode, testcases, runnerUrl) {
  const inputs = testcases.map((tc) => tc.inputString);
  
  try {
    const response = await axios.post(
      `${runnerUrl}/batch`,
      {
        oracleCode,
        candidateCode,
        inputs,
        stopOnMismatch: false, // Find all mismatches in batch
      },
      { timeout: 60000 }
    );
    
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return { status: "TIMEOUT", error: "Batch request timeout" };
    }
    return { status: "ERROR", error: error.message };
  }
}

/**
 * Main optimized differential testing function
 * 
 * Uses batch processing for improved throughput.
 */
export async function runBatchDifferentialTest(params) {
  const {
    oracleCode,
    candidateCode,
    nMin = DEFAULT_CONFIG.nMin,
    nMax = DEFAULT_CONFIG.nMax,
    vMin = DEFAULT_CONFIG.vMin,
    vMax = DEFAULT_CONFIG.vMax,
    maxTestcases = DEFAULT_CONFIG.maxTestcases,
    maxTimeMs = DEFAULT_CONFIG.maxTimeMs,
    batchSize = DEFAULT_CONFIG.batchSize,
    runnerUrl = DEFAULT_CONFIG.runnerUrl,
  } = params;
  
  // Validate inputs
  if (!oracleCode || !candidateCode) {
    throw new Error("Both oracleCode and candidateCode are required");
  }
  
  if (nMin < 0 || nMax < nMin) {
    throw new Error("Invalid array length constraints");
  }
  
  if (vMax < vMin) {
    throw new Error("Invalid value constraints");
  }
  
  const config = { nMin, nMax, vMin, vMax };
  const startTime = Date.now();
  
  // Statistics
  const stats = {
    totalTested: 0,
    totalFailing: 0,
    totalBatches: 0,
    compileErrors: 0,
    runtimeErrors: 0,
  };
  
  let smallestFailingTestcase = null;
  const allFailingTestcases = [];
  
  // Process in batches
  let remainingTestcases = maxTestcases;
  
  while (remainingTestcases > 0) {
    // Check time budget
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxTimeMs) {
      break;
    }
    
    // Generate batch
    const currentBatchSize = Math.min(batchSize, remainingTestcases);
    const testcases = generateTestcases(currentBatchSize, config);
    
    // Run batch
    const batchResult = await runBatch(oracleCode, candidateCode, testcases, runnerUrl);
    stats.totalBatches++;
    
    // Handle compile errors
    if (batchResult.status === "COMPILE_ERROR") {
      stats.compileErrors++;
      return {
        status: "COMPILE_ERROR",
        message: `${batchResult.program} failed to compile`,
        error: batchResult.error,
        statistics: stats,
      };
    }
    
    // Handle other errors
    if (batchResult.status === "ERROR" || batchResult.status === "TIMEOUT") {
      // Log and continue with reduced batch size on next iteration
      console.error("Batch error:", batchResult.error);
      remainingTestcases -= currentBatchSize;
      continue;
    }
    
    // Process results
    if (batchResult.status === "OK") {
      stats.totalTested += batchResult.totalTests;
      
      for (const mismatch of batchResult.mismatches) {
        stats.totalFailing++;
        
        const testcase = testcases[mismatch.index];
        const failingRecord = {
          n: testcase.n,
          array: testcase.array,
          input: testcase.inputString,
          oracleOutput: mismatch.oracle.output,
          oracleStatus: mismatch.oracle.status,
          candidateOutput: mismatch.candidate.output,
          candidateStatus: mismatch.candidate.status,
          failureReason: determineFailureReason(mismatch.oracle, mismatch.candidate),
        };
        
        allFailingTestcases.push(failingRecord);
        
        // Track smallest
        if (!smallestFailingTestcase || testcase.n < smallestFailingTestcase.n) {
          smallestFailingTestcase = failingRecord;
        }
      }
    }
    
    remainingTestcases -= currentBatchSize;
  }
  
  const totalTimeMs = Date.now() - startTime;
  stats.totalTimeMs = totalTimeMs;
  stats.testcasesPerSecond = (stats.totalTested / totalTimeMs * 1000).toFixed(2);
  
  // Build response
  if (smallestFailingTestcase) {
    return {
      status: "FAILING_TESTCASE_FOUND",
      message: `Found ${stats.totalFailing} failing testcase(s). Returning smallest (n=${smallestFailingTestcase.n}).`,
      smallestFailingTestcase,
      statistics: stats,
      constraints: { nMin, nMax, vMin, vMax },
    };
  } else {
    return {
      status: "NO_FAILING_TESTCASE",
      message: `No failing testcase found after ${stats.totalTested} testcases.`,
      smallestFailingTestcase: null,
      statistics: stats,
      constraints: { nMin, nMax, vMin, vMax },
      note: "This does NOT guarantee correctness.",
    };
  }
}

/**
 * Determines the reason for failure based on execution results
 */
function determineFailureReason(oracle, candidate) {
  if (oracle.status === "OK" && candidate.status === "OK") {
    return "OUTPUT_MISMATCH";
  }
  if (oracle.status === "OK" && candidate.status !== "OK") {
    return `CANDIDATE_${candidate.status}`;
  }
  if (oracle.status !== "OK" && candidate.status === "OK") {
    return `ORACLE_${oracle.status}`;
  }
  return "DIFFERENT_ERROR_TYPES";
}

/**
 * Performs focused testing around a specific array length
 * Useful for refining the minimum failing testcase
 */
export async function focusedTest(params) {
  const {
    oracleCode,
    candidateCode,
    targetN,
    vMin = DEFAULT_CONFIG.vMin,
    vMax = DEFAULT_CONFIG.vMax,
    testCount = 100,
    runnerUrl = DEFAULT_CONFIG.runnerUrl,
  } = params;
  
  // Generate testcases with exact length targetN
  const config = { nMin: targetN, nMax: targetN, vMin, vMax };
  const testcases = generateTestcases(testCount, config);
  
  const batchResult = await runBatch(oracleCode, candidateCode, testcases, runnerUrl);
  
  if (batchResult.status !== "OK") {
    return batchResult;
  }
  
  const failingTestcases = batchResult.mismatches.map((mismatch) => {
    const tc = testcases[mismatch.index];
    return {
      n: tc.n,
      array: tc.array,
      input: tc.inputString,
      oracleOutput: mismatch.oracle.output,
      candidateOutput: mismatch.candidate.output,
    };
  });
  
  return {
    status: "OK",
    targetN,
    totalTested: batchResult.totalTests,
    totalFailing: failingTestcases.length,
    failingTestcases,
    failureRate: (failingTestcases.length / batchResult.totalTests * 100).toFixed(2) + "%",
  };
}

export default {
  runBatchDifferentialTest,
  focusedTest,
};
