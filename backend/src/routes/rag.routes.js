/**
 * ============================================================================
 * RAG ROUTES - Search API for CP Helper
 * ============================================================================
 */

import express from 'express';
import { search, getStatus, ask } from '../services/rag.service.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/rag/search
 * Search for relevant content based on a query (Protected)
 * 
 * Body: { query: string, topK?: number }
 * Response: { results: Array<{ text, score, source, page }> }
 */
router.post('/search', protect, async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }
    
    const startTime = Date.now();
    const results = await search(query, topK);
    const searchTime = Date.now() - startTime;
    
    res.json({
      query,
      results,
      searchTime: `${searchTime}ms`,
      count: results.length
    });
  } catch (error) {
    console.error('RAG search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/rag/ask
 * Ask a question and get an AI-generated answer (Protected)
 * 
 * Body: { question: string, topK?: number }
 * Response: { question, answer, sources }
 */
router.post('/ask', protect, async (req, res) => {
  try {
    const { question, topK = 5 } = req.body;
    
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        error: 'Question is required and must be a string' 
      });
    }
    
    const startTime = Date.now();
    const result = await ask(question, topK);
    const totalTime = Date.now() - startTime;
    
    res.json({
      ...result,
      responseTime: `${totalTime}ms`
    });
  } catch (error) {
    console.error('RAG ask error:', error);
    res.status(500).json({ 
      error: 'Failed to generate answer',
      message: error.message 
    });
  }
});

/**
 * GET /api/rag/status
 * Get the status of the RAG service
 */
router.get('/status', (req, res) => {
  const status = getStatus();
  res.json(status);
});

export default router;
