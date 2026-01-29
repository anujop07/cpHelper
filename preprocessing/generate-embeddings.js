/**
 * ============================================================================
 * RAG PREPROCESSING - STEP 3: EMBEDDINGS GENERATION
 * ============================================================================
 * 
 * PURPOSE:
 * Convert text chunks into vector embeddings using a LOCAL model.
 * No API calls, no costs - everything runs on your machine.
 * 
 * WHAT ARE EMBEDDINGS? (Interview Explanation)
 * ---------------------------------------------
 * Embeddings convert text into vectors (lists of numbers) that capture MEANING.
 * 
 * Example:
 *   "binary search"      → [0.12, -0.45, 0.78, ...]
 *   "logarithmic lookup" → [0.11, -0.44, 0.79, ...]  ← Similar vectors! Same meaning.
 *   "pizza recipe"       → [0.89, 0.23, -0.56, ...]  ← Different vector. Different topic.
 * 
 * WHY THIS MATTERS FOR RAG:
 * - When user asks "How do I implement binary search?"
 * - We convert their question to a vector
 * - Find chunks with SIMILAR vectors (not just keyword matching!)
 * - Return those as context for the LLM
 * 
 * This is why RAG can find "logarithmic lookup" when you search "binary search"
 * - they have similar MEANING even though the words are different.
 * 
 * MODEL USED: all-MiniLM-L6-v2
 * - 384-dimensional embeddings
 * - Fast and accurate for semantic search
 * - ~80MB download on first run, then cached
 * 
 * ============================================================================
 */

import { pipeline } from '@xenova/transformers';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Input: chunks from Step 2
  inputFile: './output/chunks.json',
  
  // Output: chunks with embeddings
  outputFile: './output/embeddings.json',
  
  // Model: all-MiniLM-L6-v2 (384 dimensions, fast, good quality)
  // This runs LOCALLY - no API calls!
  modelName: 'Xenova/all-MiniLM-L6-v2',
  
  // How many chunks to process before showing progress
  progressInterval: 100,
  
  // Batch size for embedding (process multiple at once for speed)
  batchSize: 32
};

// ============================================================================
// MAIN EMBEDDING FUNCTION
// ============================================================================

async function generateEmbeddings() {
  console.log('🧠 Starting embedding generation...\n');
  
  // -------------------------------------------------------------------------
  // Step 1: Load chunks from Step 2
  // -------------------------------------------------------------------------
  console.log('📖 Loading chunks from Step 2...');
  
  const chunksPath = path.resolve(CONFIG.inputFile);
  const chunksData = JSON.parse(await fs.readFile(chunksPath, 'utf-8'));
  const chunks = chunksData.chunks;
  
  console.log(`   Found ${chunks.length} chunks to embed\n`);
  
  // -------------------------------------------------------------------------
  // Step 2: Load the embedding model
  // -------------------------------------------------------------------------
  console.log('🔧 Loading embedding model (first run downloads ~80MB)...');
  console.log(`   Model: ${CONFIG.modelName}\n`);
  
  // The 'pipeline' function loads the model
  // 'feature-extraction' means we're extracting embedding vectors
  const embedder = await pipeline('feature-extraction', CONFIG.modelName);
  
  console.log('   ✅ Model loaded successfully!\n');
  
  // -------------------------------------------------------------------------
  // Step 3: Generate embeddings for each chunk
  // -------------------------------------------------------------------------
  console.log('⚡ Generating embeddings...');
  console.log(`   Processing in batches of ${CONFIG.batchSize}\n`);
  
  const embeddedChunks = [];
  const startTime = Date.now();
  
  // Process in batches for efficiency
  for (let i = 0; i < chunks.length; i += CONFIG.batchSize) {
    const batch = chunks.slice(i, Math.min(i + CONFIG.batchSize, chunks.length));
    const texts = batch.map(chunk => chunk.text);
    
    // Generate embeddings for the batch
    // pooling: 'mean' averages all token embeddings into one vector
    // normalize: true makes vectors unit length (important for cosine similarity)
    const outputs = await embedder(texts, { pooling: 'mean', normalize: true });
    
    // Process each result in the batch
    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      // Convert from Tensor to regular array
      const embedding = Array.from(outputs[j].data);
      
      embeddedChunks.push({
        id: chunk.id,
        text: chunk.text,
        embedding: embedding,
        metadata: chunk.metadata
      });
    }
    
    // Show progress
    const processed = Math.min(i + CONFIG.batchSize, chunks.length);
    if (processed % CONFIG.progressInterval === 0 || processed === chunks.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (processed / elapsed).toFixed(1);
      process.stdout.write(`\r   📊 Progress: ${processed}/${chunks.length} chunks (${rate} chunks/sec)`);
    }
  }
  
  console.log('\n');
  
  // -------------------------------------------------------------------------
  // Step 4: Save embeddings to file
  // -------------------------------------------------------------------------
  console.log('💾 Saving embeddings...');
  
  const outputData = {
    embeddedAt: new Date().toISOString(),
    model: CONFIG.modelName,
    dimensions: embeddedChunks[0]?.embedding.length || 384,
    totalChunks: embeddedChunks.length,
    embeddings: embeddedChunks
  };
  
  const outputPath = path.resolve(CONFIG.outputFile);
  await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
  
  // -------------------------------------------------------------------------
  // Step 5: Show summary
  // -------------------------------------------------------------------------
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const fileSize = (await fs.stat(outputPath)).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
  
  console.log('\n📊 EMBEDDING COMPLETE!\n');
  console.log('┌─────────────────────────────────────────┐');
  console.log(`│ Chunks Embedded: ${embeddedChunks.length.toString().padStart(20)} │`);
  console.log(`│ Dimensions:      ${outputData.dimensions.toString().padStart(20)} │`);
  console.log(`│ Time Taken:      ${(totalTime + 's').padStart(20)} │`);
  console.log(`│ Output Size:     ${(fileSizeMB + ' MB').padStart(20)} │`);
  console.log('└─────────────────────────────────────────┘');
  console.log(`\n📁 Saved to: ${outputPath}`);
  
  // -------------------------------------------------------------------------
  // Verify embeddings (spot check)
  // -------------------------------------------------------------------------
  console.log('\n🔍 Spot Check (first embedding):');
  const sample = embeddedChunks[0];
  console.log(`   ID: ${sample.id}`);
  console.log(`   Text: "${sample.text.substring(0, 50)}..."`);
  console.log(`   Embedding: [${sample.embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}, ...]`);
  console.log(`   Length: ${sample.embedding.length} dimensions`);
}

// ============================================================================
// RUN
// ============================================================================

generateEmbeddings().catch(console.error);
