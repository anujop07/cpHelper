import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.json({ limit: "10mb" })); // Increase limit for large code submissions

/**
 * Executes a C++ program in a Docker container
 * @param {string} tempDir - Temporary directory with code and input
 * @param {string} codeFile - Name of the code file (e.g., "code.cpp")
 * @param {string} execName - Name of the executable (e.g., "main")
 * @returns {Promise<object>} Execution result
 */
function executeInDocker(tempDir, codeFile, execName) {
  return new Promise((resolve) => {
    const cmd =
      `docker run --rm ` +
      `--cpus="1" ` +
      `--memory="256m" ` +
      `--network=none ` +
      `-v "${tempDir}:/app" ` +
      `cpp-runner ` +
      `bash -c "g++ ${codeFile} -O2 -o ${execName} && timeout 2s ./${execName} < input.txt"`;

    exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) {
          resolve({ status: "TLE", error: "Time Limit Exceeded", output: null });
        } else if (stderr.includes("error:")) {
          resolve({ status: "CE", error: stderr, output: null });
        } else if (stderr.includes("Killed")) {
          resolve({ status: "MLE", error: "Memory Limit Exceeded", output: null });
        } else {
          resolve({ status: "RE", error: stderr, output: null });
        }
      } else {
        resolve({ status: "OK", output: stdout, error: null });
      }
    });
  });
}

/**
 * POST /run
 * Runs a single C++ program with given input
 */
app.post("/run", async (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ status: "ERROR", error: "Code is required" });
  }

  const id = uuid();
  const tempDir = path.join(process.cwd(), "tmp", id);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(tempDir, "code.cpp"), code);
    fs.writeFileSync(path.join(tempDir, "input.txt"), input || "");

    const result = await executeInDocker(tempDir, "code.cpp", "main");
    return res.json(result);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

/**
 * POST /differential
 * Runs differential testing: executes oracle and candidate with same input,
 * returns both outputs for comparison.
 * 
 * Request body:
 * {
 *   oracleCode: string,
 *   candidateCode: string,
 *   input: string
 * }
 */
app.post("/differential", async (req, res) => {
  const { oracleCode, candidateCode, input } = req.body;

  if (!oracleCode) {
    return res.status(400).json({ status: "ERROR", error: "oracleCode is required" });
  }
  if (!candidateCode) {
    return res.status(400).json({ status: "ERROR", error: "candidateCode is required" });
  }

  const id = uuid();
  const tempDir = path.join(process.cwd(), "tmp", id);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Write both code files and input
    fs.writeFileSync(path.join(tempDir, "oracle.cpp"), oracleCode);
    fs.writeFileSync(path.join(tempDir, "candidate.cpp"), candidateCode);
    fs.writeFileSync(path.join(tempDir, "input.txt"), input || "");

    // Execute both programs (sequentially to avoid resource contention)
    const oracleResult = await executeInDocker(tempDir, "oracle.cpp", "oracle");
    const candidateResult = await executeInDocker(tempDir, "candidate.cpp", "candidate");

    // Compare outputs
    const oracleOutput = normalizeOutput(oracleResult.output);
    const candidateOutput = normalizeOutput(candidateResult.output);
    const outputsMatch = oracleOutput === candidateOutput;

    return res.json({
      status: "OK",
      oracle: oracleResult,
      candidate: candidateResult,
      comparison: {
        outputsMatch,
        oracleBehavior: oracleResult.status,
        candidateBehavior: candidateResult.status,
      },
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

/**
 * POST /batch
 * Runs batch differential testing with multiple inputs.
 * More efficient than multiple /differential calls.
 * 
 * Request body:
 * {
 *   oracleCode: string,
 *   candidateCode: string,
 *   inputs: string[],          // Array of input strings
 *   stopOnMismatch: boolean    // If true, stop at first mismatch
 * }
 */
app.post("/batch", async (req, res) => {
  const { oracleCode, candidateCode, inputs, stopOnMismatch = false } = req.body;

  if (!oracleCode) {
    return res.status(400).json({ status: "ERROR", error: "oracleCode is required" });
  }
  if (!candidateCode) {
    return res.status(400).json({ status: "ERROR", error: "candidateCode is required" });
  }
  if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
    return res.status(400).json({ status: "ERROR", error: "inputs array is required" });
  }

  // Limit batch size
  const maxBatchSize = 100;
  if (inputs.length > maxBatchSize) {
    return res.status(400).json({
      status: "ERROR",
      error: `Batch size exceeds limit of ${maxBatchSize}`,
    });
  }

  const id = uuid();
  const tempDir = path.join(process.cwd(), "tmp", id);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Write code files once
    fs.writeFileSync(path.join(tempDir, "oracle.cpp"), oracleCode);
    fs.writeFileSync(path.join(tempDir, "candidate.cpp"), candidateCode);

    // Compile both programs first
    const compileOracle = await compileCode(tempDir, "oracle.cpp", "oracle");
    if (!compileOracle.success) {
      return res.json({
        status: "COMPILE_ERROR",
        program: "oracle",
        error: compileOracle.error,
      });
    }

    const compileCandidate = await compileCode(tempDir, "candidate.cpp", "candidate");
    if (!compileCandidate.success) {
      return res.json({
        status: "COMPILE_ERROR",
        program: "candidate",
        error: compileCandidate.error,
      });
    }

    const results = [];
    let mismatches = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      fs.writeFileSync(path.join(tempDir, "input.txt"), input);

      // Run pre-compiled executables
      const oracleResult = await runCompiled(tempDir, "oracle");
      const candidateResult = await runCompiled(tempDir, "candidate");

      const oracleOutput = normalizeOutput(oracleResult.output);
      const candidateOutput = normalizeOutput(candidateResult.output);
      const outputsMatch = oracleOutput === candidateOutput;

      const testResult = {
        index: i,
        input,
        oracle: oracleResult,
        candidate: candidateResult,
        outputsMatch,
      };

      results.push(testResult);

      if (!outputsMatch) {
        mismatches.push(testResult);
        if (stopOnMismatch) {
          break;
        }
      }
    }

    return res.json({
      status: "OK",
      totalTests: results.length,
      totalMismatches: mismatches.length,
      results,
      mismatches,
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

/**
 * Compiles C++ code without running
 */
function compileCode(tempDir, codeFile, execName) {
  return new Promise((resolve) => {
    const cmd =
      `docker run --rm ` +
      `--cpus="1" ` +
      `--memory="256m" ` +
      `--network=none ` +
      `-v "${tempDir}:/app" ` +
      `cpp-runner ` +
      `bash -c "g++ ${codeFile} -O2 -o ${execName}"`;

    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ success: false, error: stderr });
      } else {
        resolve({ success: true });
      }
    });
  });
}

/**
 * Runs a pre-compiled executable
 */
function runCompiled(tempDir, execName) {
  return new Promise((resolve) => {
    const cmd =
      `docker run --rm ` +
      `--cpus="1" ` +
      `--memory="256m" ` +
      `--network=none ` +
      `-v "${tempDir}:/app" ` +
      `cpp-runner ` +
      `bash -c "timeout 2s ./${execName} < input.txt"`;

    exec(cmd, { timeout: 5000 }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) {
          resolve({ status: "TLE", error: "Time Limit Exceeded", output: null });
        } else if (stderr.includes("Killed")) {
          resolve({ status: "MLE", error: "Memory Limit Exceeded", output: null });
        } else {
          resolve({ status: "RE", error: stderr, output: null });
        }
      } else {
        resolve({ status: "OK", output: stdout, error: null });
      }
    });
  });
}

/**
 * Normalizes output for comparison
 */
function normalizeOutput(output) {
  if (!output) return "";
  return output.replace(/\r\n/g, "\n").trim();
}

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "runner" });
});

app.listen(4000, () => {
  console.log("🚀 Runner service running on port 4000");
});
