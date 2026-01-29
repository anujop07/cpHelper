/**
 * ============================================================================
 * RAG SERVICE - Vector Search for CP Helper
 * ============================================================================
 * 
 * This service provides semantic search over competitive programming content.
 * It loads the pre-built vector index and performs similarity search.
 * 
 * MINIMAL IMPACT: This is a self-contained service that doesn't modify
 * any existing backend code.
 * 
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Path to index files (relative to backend root)
  indexDir: path.join(__dirname, '../../..', 'preprocessing/output'),
  vectorsFile: 'index-vectors.bin',
  metadataFile: 'index-metadata.json',
  
  // Embedding model (must match preprocessing)
  modelName: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
  
  // Default search settings
  defaultTopK: 5
};

// ============================================================================
// STATE (Lazy loaded)
// ============================================================================

let vectors = null;      // Float32Array of all vectors
let metadata = null;     // Array of chunk metadata
let embedder = null;     // Embedding model
let isLoaded = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Load the vector index into memory (called once on first search)
 */
async function loadIndex() {
  if (isLoaded) return;
  
  console.log('🔍 RAG: Loading vector index...');
  
  const vectorsPath = path.join(CONFIG.indexDir, CONFIG.vectorsFile);
  const metadataPath = path.join(CONFIG.indexDir, CONFIG.metadataFile);
  
  // Check if files exist
  if (!fs.existsSync(vectorsPath) || !fs.existsSync(metadataPath)) {
    throw new Error(`RAG index files not found. Run preprocessing first:\n  cd preprocessing && npm run index`);
  }
  
  // Load binary vectors
  const buffer = fs.readFileSync(vectorsPath);
  vectors = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
  
  // Load metadata
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  
  console.log(`   ✅ Loaded ${metadata.numVectors} vectors (${CONFIG.dimensions} dimensions)`);
  
  // Load embedding model
  console.log('🔧 RAG: Loading embedding model...');
  embedder = await pipeline('feature-extraction', CONFIG.modelName);
  console.log('   ✅ Model loaded');
  
  isLoaded = true;
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Compute cosine similarity between two vectors
 * Since our vectors are normalized, this is just the dot product
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

/**
 * Get a vector from the index by its position
 */
function getVector(index) {
  const start = index * CONFIG.dimensions;
  return vectors.slice(start, start + CONFIG.dimensions);
}

/**
 * Search for similar chunks given a query
 * @param {string} query - The search query
 * @param {number} topK - Number of results to return
 * @returns {Array} - Top K results with scores and metadata
 */
export async function search(query, topK = CONFIG.defaultTopK) {
  // Ensure index is loaded
  await loadIndex();
  
  // Embed the query
  const output = await embedder(query, { pooling: 'mean', normalize: true });
  const queryVector = Array.from(output.data);
  
  // Calculate similarity with all vectors
  const scores = [];
  for (let i = 0; i < metadata.numVectors; i++) {
    const docVector = getVector(i);
    const score = cosineSimilarity(queryVector, docVector);
    scores.push({ index: i, score });
  }
  
  // Sort by score (descending) and take top K
  scores.sort((a, b) => b.score - a.score);
  const topResults = scores.slice(0, topK);
  
  // Format results with metadata
  return topResults.map(({ index, score }) => {
    const item = metadata.items[index];
    return {
      id: item.id,
      text: item.text,
      score: parseFloat(score.toFixed(4)),
      source: item.metadata.source,
      page: item.metadata.pageNumber,
      filepath: item.metadata.filepath
    };
  });
}

/**
 * Get the status of the RAG service
 */
export function getStatus() {
  return {
    loaded: isLoaded,
    numVectors: metadata?.numVectors || 0,
    dimensions: CONFIG.dimensions,
    model: CONFIG.modelName
  };
}

// ============================================================================
// GROQ LLM INTEGRATION (Fast!)
// ============================================================================

import Groq from 'groq-sdk';

// Initialize Groq (lazy)
let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Ask a question and get an AI-generated answer using retrieved context
 * Uses Groq for ultra-fast responses (~1-2 seconds!)
 * @param {string} question - The user's question
 * @param {number} topK - Number of context chunks to retrieve
 * @returns {Object} - Answer with sources
 */
export async function ask(question, topK = 7) {
  // Step 1: Retrieve relevant chunks
  const chunks = await search(question, topK);
  
  // Step 2: Build context from chunks
  const context = chunks
    .map((chunk, i) => `[Source ${i + 1}: ${chunk.source}, Page ${chunk.page}]\n${chunk.text}`)
    .join('\n\n---\n\n');
  
  // Step 3: Create CODE-FIRST prompt - minimal explanation, maximum code
  const prompt = `You are a competitive programming code assistant. Give DIRECT, CODE-HEAVY answers.

CONTEXT:
${context}

QUESTION: ${question}

RULES - FOLLOW STRICTLY:
1. Give a BRIEF explanation (2-5 lines MAX) - what the topic is and when to use it
2. Then IMMEDIATELY give COMPLETE, WORKING C++ CODE with:
   - All necessary includes
   - Template code ready to copy-paste
   - Comments explaining key parts
   - Example usage in main()
3. After code: ONE LINE for time complexity, ONE LINE for space complexity
4. NO long theory paragraphs - users want CODE, not essays

FORMAT:
**What it is:** [1-2 sentences]
**When to use:** [1-2 sentences]

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

// Complete working code here
// With comments on key logic

int main() {
    // Example usage
}
\`\`\`

**Complexity:** Time O(?), Space O(?)

Now give the code-focused answer:`;

  // Step 4: Get answer from Groq (ultra-fast!)
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,  // Lower for more consistent, focused answers
    max_tokens: 2048   // Increased for detailed code + explanations
  });
  
  const answer = completion.choices[0]?.message?.content || 'No answer generated';
  
  // Return answer with sources
  return {
    question,
    answer,
    sources: chunks.map(c => ({
      source: c.source,
      page: c.page,
      score: c.score
    }))
  };
}

export default { search, getStatus, ask };
