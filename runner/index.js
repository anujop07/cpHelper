import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "CP Helper Runner",
    message: "C++ execution service is running! 🚀"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/**
 * Normalize output for comparison
 */
function normalizeOutput(output) {
  if (!output) return "";
  return output.toString().trim().replace(/\r\n/g, "\n");
}

/**
 * Execute C++ code directly (Railway has GCC installed via Dockerfile)
 */
function executeCode(tempDir, codeFile, execName) {
  return new Promise((resolve) => {
    const codePath = path.join(tempDir, codeFile);
    const execPath = path.join(tempDir, execName);
    const inputPath = path.join(tempDir, "input.txt");

    // Compile
    const compileCmd = `g++ "${codePath}" -O2 -o "${execPath}" 2>&1`;

    exec(compileCmd, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
      if (compileErr) {
        return resolve({
          status: "CE",
          error: compileStderr || compileStdout || "Compilation Error",
          output: null,
        });
      }

      // Run with timeout
      const runCmd = `timeout 2s "${execPath}" < "${inputPath}" 2>&1`;

      exec(runCmd, { timeout: 5000, maxBuffer: 1024 * 1024 }, (runErr, stdout, stderr) => {
        if (runErr) {
          if (runErr.killed || runErr.signal === "SIGTERM") {
            return resolve({ status: "TLE", error: "Time Limit Exceeded", output: null });
          }
          return resolve({ status: "RE", error: stderr || runErr.message, output: null });
        }
        resolve({ status: "OK", output: stdout, error: null });
      });
    });
  });
}

/**
 * Compile only (for batch processing)
 */
function compileCode(tempDir, codeFile, execName) {
  return new Promise((resolve) => {
    const codePath = path.join(tempDir, codeFile);
    const execPath = path.join(tempDir, execName);

    exec(`g++ "${codePath}" -O2 -o "${execPath}" 2>&1`, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ success: false, error: stderr || stdout || "Compilation failed" });
      } else {
        resolve({ success: true });
      }
    });
  });
}

/**
 * Run already compiled code
 */
function runCompiled(tempDir, execName) {
  return new Promise((resolve) => {
    const execPath = path.join(tempDir, execName);
    const inputPath = path.join(tempDir, "input.txt");

    exec(`timeout 2s "${execPath}" < "${inputPath}" 2>&1`, { timeout: 5000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        if (err.killed) {
          resolve({ status: "TLE", error: "Time Limit Exceeded", output: null });
        } else {
          resolve({ status: "RE", error: stderr || err.message, output: null });
        }
      } else {
        resolve({ status: "OK", output: stdout, error: null });
      }
    });
  });
}

/**
 * POST /run - Run single C++ program
 */
app.post("/run", async (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ status: "ERROR", error: "Code is required" });
  }

  const id = uuid();
  const tempDir = path.join(process.cwd(), "tmp", id);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, "code.cpp"), code);
    fs.writeFileSync(path.join(tempDir, "input.txt"), input || "");

    const result = await executeCode(tempDir, "code.cpp", "main");
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ status: "ERROR", error: err.message });
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
});

/**
 * POST /differential - Compare oracle and candidate
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

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, "oracle.cpp"), oracleCode);
    fs.writeFileSync(path.join(tempDir, "candidate.cpp"), candidateCode);
    fs.writeFileSync(path.join(tempDir, "input.txt"), input || "");

    const [oracleResult, candidateResult] = await Promise.all([
      executeCode(tempDir, "oracle.cpp", "oracle"),
      executeCode(tempDir, "candidate.cpp", "candidate"),
    ]);

    const oracleOutput = normalizeOutput(oracleResult.output);
    const candidateOutput = normalizeOutput(candidateResult.output);

    return res.json({
      status: "OK",
      oracle: oracleResult,
      candidate: candidateResult,
      comparison: {
        outputsMatch: oracleOutput === candidateOutput,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: "ERROR", error: err.message });
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
});

/**
 * POST /batch - Batch differential testing
 */
app.post("/batch", async (req, res) => {
  const { oracleCode, candidateCode, inputs, stopOnMismatch = false } = req.body;

  if (!oracleCode || !candidateCode) {
    return res.status(400).json({ status: "ERROR", error: "Both codes required" });
  }
  if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
    return res.status(400).json({ status: "ERROR", error: "inputs array is required" });
  }

  const maxBatchSize = 100;
  if (inputs.length > maxBatchSize) {
    return res.status(400).json({ status: "ERROR", error: `Max batch size is ${maxBatchSize}` });
  }

  const id = uuid();
  const tempDir = path.join(process.cwd(), "tmp", id);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, "oracle.cpp"), oracleCode);
    fs.writeFileSync(path.join(tempDir, "candidate.cpp"), candidateCode);

    // Compile both first
    const oracleCompile = await compileCode(tempDir, "oracle.cpp", "oracle");
    if (!oracleCompile.success) {
      return res.json({ status: "COMPILE_ERROR", program: "oracle", error: oracleCompile.error });
    }

    const candidateCompile = await compileCode(tempDir, "candidate.cpp", "candidate");
    if (!candidateCompile.success) {
      return res.json({ status: "COMPILE_ERROR", program: "candidate", error: candidateCompile.error });
    }

    const results = [];
    const mismatches = [];

    for (let i = 0; i < inputs.length; i++) {
      fs.writeFileSync(path.join(tempDir, "input.txt"), inputs[i]);

      const [oracleResult, candidateResult] = await Promise.all([
        runCompiled(tempDir, "oracle"),
        runCompiled(tempDir, "candidate"),
      ]);

      const oracleOutput = normalizeOutput(oracleResult.output);
      const candidateOutput = normalizeOutput(candidateResult.output);
      const outputsMatch = oracleOutput === candidateOutput;

      const testResult = {
        index: i,
        input: inputs[i],
        oracle: oracleResult,
        candidate: candidateResult,
        outputsMatch,
      };

      results.push(testResult);

      if (!outputsMatch) {
        mismatches.push(testResult);
        if (stopOnMismatch) break;
      }
    }

    return res.json({
      status: "OK",
      totalTests: results.length,
      totalMismatches: mismatches.length,
      results,
      mismatches,
    });
  } catch (err) {
    return res.status(500).json({ status: "ERROR", error: err.message });
  } finally {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Runner service running on port ${PORT}`);
});