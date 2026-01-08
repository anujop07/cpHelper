/**
 * Differential Testing Controller
 * 
 * Handles API requests for differential testing between
 * oracle (correct) and candidate (faulty) C++ implementations.
 */

import {
  runDifferentialTest,
  validateOracle,
  validateCandidate,
} from "../services/differentialTest.service.js";

import {
  runBatchDifferentialTest,
  focusedTest,
} from "../services/batchDifferentialTest.service.js";

/**
 * POST /api/differential/test
 * 
 * Runs differential testing between oracle and candidate code.
 * 
 * Request Body:
 * {
 *   oracleCode: string,      // Correct C++ implementation (required)
 *   candidateCode: string,   // Faulty C++ implementation (required)
 *   nMin: number,            // Minimum array length (optional, default: 1)
 *   nMax: number,            // Maximum array length (optional, default: 100)
 *   vMin: number,            // Minimum element value (optional, default: -1000)
 *   vMax: number,            // Maximum element value (optional, default: 1000)
 *   maxTestcases: number,    // Max testcases to run (optional, default: 1000)
 *   maxTimeMs: number        // Max time budget in ms (optional, default: 30000)
 * }
 * 
 * Response:
 * - 200: Testing completed (may or may not have found failing testcase)
 * - 400: Invalid request parameters
 * - 500: Internal server error
 */
export const runTest = async (req, res) => {
  try {
    const {
      oracleCode,
      candidateCode,
      // Support flat parameters
      nMin: flatNMin,
      nMax: flatNMax,
      vMin: flatVMin,
      vMax: flatVMax,
      maxTestcases: flatMaxTestcases,
      maxTimeMs: flatMaxTimeMs,
      // Support nested format
      inputConstraints,
      testingBudget,
    } = req.body;

    // Extract from nested format if provided, otherwise use flat params
    const nMin = inputConstraints?.array?.nMin ?? flatNMin;
    const nMax = inputConstraints?.array?.nMax ?? flatNMax;
    const vMin = inputConstraints?.array?.valueMin ?? flatVMin;
    const vMax = inputConstraints?.array?.valueMax ?? flatVMax;
    const maxTestcases = testingBudget?.maxTestcases ?? flatMaxTestcases;
    const maxTimeMs = testingBudget?.maxTimeMs ?? flatMaxTimeMs;

    // Validate required fields
    if (!oracleCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "oracleCode is required",
      });
    }

    if (!candidateCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "candidateCode is required",
      });
    }

    // Validate constraint parameters if provided
    if (nMin !== undefined && (typeof nMin !== "number" || nMin < 0)) {
      return res.status(400).json({
        status: "ERROR",
        error: "nMin must be a non-negative number",
      });
    }

    if (nMax !== undefined && (typeof nMax !== "number" || nMax < 0)) {
      return res.status(400).json({
        status: "ERROR",
        error: "nMax must be a non-negative number",
      });
    }

    if (nMin !== undefined && nMax !== undefined && nMin > nMax) {
      return res.status(400).json({
        status: "ERROR",
        error: "nMin cannot be greater than nMax",
      });
    }

    if (vMin !== undefined && typeof vMin !== "number") {
      return res.status(400).json({
        status: "ERROR",
        error: "vMin must be a number",
      });
    }

    if (vMax !== undefined && typeof vMax !== "number") {
      return res.status(400).json({
        status: "ERROR",
        error: "vMax must be a number",
      });
    }

    if (vMin !== undefined && vMax !== undefined && vMin > vMax) {
      return res.status(400).json({
        status: "ERROR",
        error: "vMin cannot be greater than vMax",
      });
    }

    // Validate budget parameters
    if (maxTestcases !== undefined && (typeof maxTestcases !== "number" || maxTestcases < 1)) {
      return res.status(400).json({
        status: "ERROR",
        error: "maxTestcases must be a positive number",
      });
    }

    if (maxTimeMs !== undefined && (typeof maxTimeMs !== "number" || maxTimeMs < 1000)) {
      return res.status(400).json({
        status: "ERROR",
        error: "maxTimeMs must be at least 1000 (1 second)",
      });
    }

    // Enforce safety limits
    const safeMaxTestcases = Math.min(maxTestcases || 1000, 10000);
    const safeMaxTimeMs = Math.min(maxTimeMs || 30000, 120000); // Max 2 minutes

    // Run differential testing
    const result = await runDifferentialTest({
      oracleCode,
      candidateCode,
      nMin,
      nMax,
      vMin,
      vMax,
      maxTestcases: safeMaxTestcases,
      maxTimeMs: safeMaxTimeMs,
    });

    return res.json(result);
  } catch (error) {
    console.error("Differential test error:", error);
    return res.status(500).json({
      status: "ERROR",
      error: error.message || "Internal server error during differential testing",
    });
  }
};

/**
 * POST /api/differential/validate
 * 
 * Validates that oracle and candidate code can compile and run.
 * Use this before running full differential testing.
 * 
 * Request Body:
 * {
 *   oracleCode: string,    // Correct C++ implementation (required)
 *   candidateCode: string  // Faulty C++ implementation (required)
 * }
 * 
 * Response:
 * {
 *   oracleValid: boolean,
 *   oracleStatus: string,
 *   oracleError: string | null,
 *   candidateValid: boolean,
 *   candidateStatus: string,
 *   candidateError: string | null,
 *   canProceed: boolean    // True if both are valid enough to test
 * }
 */
export const validateCode = async (req, res) => {
  try {
    const { oracleCode, candidateCode } = req.body;

    if (!oracleCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "oracleCode is required",
      });
    }

    if (!candidateCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "candidateCode is required",
      });
    }

    // Validate both codes in parallel
    const [oracleValidation, candidateValidation] = await Promise.all([
      validateOracle(oracleCode),
      validateCandidate(candidateCode),
    ]);

    const canProceed = oracleValidation.valid && candidateValidation.valid;

    return res.json({
      status: "OK",
      oracleValid: oracleValidation.valid,
      oracleStatus: oracleValidation.status,
      oracleError: oracleValidation.error,
      candidateValid: candidateValidation.valid,
      candidateStatus: candidateValidation.status,
      candidateError: candidateValidation.error,
      canProceed,
      message: canProceed
        ? "Both codes are valid. Ready for differential testing."
        : "One or both codes failed validation. Check errors above.",
    });
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      status: "ERROR",
      error: error.message || "Internal server error during validation",
    });
  }
};

/**
 * GET /api/differential/info
 * 
 * Returns information about the differential testing system,
 * including supported constraints and default values.
 */
export const getInfo = (req, res) => {
  return res.json({
    status: "OK",
    system: "Differential Testing System",
    version: "1.0.0",
    description: "Large-scale randomized differential testing for C++ array-based programs",
    inputModel: {
      format: "n\\na1 a2 a3 ... an",
      description: "Array-based inputs where n is array length and ai are elements",
    },
    defaults: {
      nMin: 1,
      nMax: 100,
      vMin: -1000,
      vMax: 1000,
      maxTestcases: 1000,
      maxTimeMs: 30000,
    },
    limits: {
      maxTestcases: 10000,
      maxTimeMs: 120000,
    },
    endpoints: {
      "POST /api/differential/test": "Run differential testing (sequential)",
      "POST /api/differential/batch": "Run differential testing (batch optimized)",
      "POST /api/differential/focused": "Run focused testing at specific array length",
      "POST /api/differential/validate": "Validate oracle and candidate code",
      "GET /api/differential/info": "Get system information",
    },
  });
};

/**
 * POST /api/differential/batch
 * 
 * Runs optimized batch differential testing.
 * More efficient for large-scale testing.
 */
export const runBatchTest = async (req, res) => {
  try {
    const {
      oracleCode,
      candidateCode,
      nMin,
      nMax,
      vMin,
      vMax,
      maxTestcases,
      maxTimeMs,
      batchSize,
    } = req.body;

    // Validate required fields
    if (!oracleCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "oracleCode is required",
      });
    }

    if (!candidateCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "candidateCode is required",
      });
    }

    // Enforce safety limits
    const safeMaxTestcases = Math.min(maxTestcases || 1000, 10000);
    const safeMaxTimeMs = Math.min(maxTimeMs || 30000, 120000);
    const safeBatchSize = Math.min(batchSize || 50, 100);

    const result = await runBatchDifferentialTest({
      oracleCode,
      candidateCode,
      nMin,
      nMax,
      vMin,
      vMax,
      maxTestcases: safeMaxTestcases,
      maxTimeMs: safeMaxTimeMs,
      batchSize: safeBatchSize,
    });

    return res.json(result);
  } catch (error) {
    console.error("Batch differential test error:", error);
    return res.status(500).json({
      status: "ERROR",
      error: error.message || "Internal server error during batch testing",
    });
  }
};

/**
 * POST /api/differential/focused
 * 
 * Runs focused testing at a specific array length.
 * Useful for investigating failure patterns or refining minimum failing testcase.
 * 
 * Request Body:
 * {
 *   oracleCode: string,
 *   candidateCode: string,
 *   targetN: number,        // Specific array length to test
 *   vMin: number,
 *   vMax: number,
 *   testCount: number       // Number of testcases (default: 100)
 * }
 */
export const runFocusedTest = async (req, res) => {
  try {
    const {
      oracleCode,
      candidateCode,
      targetN,
      vMin,
      vMax,
      testCount,
    } = req.body;

    if (!oracleCode || !candidateCode) {
      return res.status(400).json({
        status: "ERROR",
        error: "Both oracleCode and candidateCode are required",
      });
    }

    if (targetN === undefined || typeof targetN !== "number" || targetN < 0) {
      return res.status(400).json({
        status: "ERROR",
        error: "targetN must be a non-negative number",
      });
    }

    const safeTestCount = Math.min(testCount || 100, 500);

    const result = await focusedTest({
      oracleCode,
      candidateCode,
      targetN,
      vMin,
      vMax,
      testCount: safeTestCount,
    });

    return res.json(result);
  } catch (error) {
    console.error("Focused test error:", error);
    return res.status(500).json({
      status: "ERROR",
      error: error.message || "Internal server error during focused testing",
    });
  }
};

export default {
  runTest,
  runBatchTest,
  runFocusedTest,
  validateCode,
  getInfo,
};
