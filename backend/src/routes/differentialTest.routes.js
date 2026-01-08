/**
 * Differential Testing Routes
 * 
 * Routes for differential testing between oracle and candidate C++ programs.
 */

import express from "express";
import {
  runTest,
  runBatchTest,
  runFocusedTest,
  validateCode,
  getInfo,
} from "../controllers/differentialTest.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get system information (public endpoint)
router.get("/info", getInfo);

// Validate code before testing (protected)
router.post("/validate", protect, validateCode);

// Run differential testing - sequential (protected)
router.post("/test", protect, runTest);

// Run differential testing - batch optimized (protected)
router.post("/batch", protect, runBatchTest);

// Run focused testing at specific array length (protected)
router.post("/focused", protect, runFocusedTest);

export default router;
