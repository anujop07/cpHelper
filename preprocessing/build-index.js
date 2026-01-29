/**
 * ============================================================================
 * RAG PREPROCESSING - STEP 4: VECTOR INDEXING
 * ============================================================================
 * 
 * PURPOSE:
 * Build a searchable vector index from embeddings.
 * Creates files that can be loaded by the backend for fast similarity search.
 * 
 * WHAT IS VECTOR INDEXING? (Interview Explanation)
 * -------------------------------------------------
 * Embeddings alone aren't searchable - they're just numbers in a JSON file.
 * An INDEX organizes them for fast retrieval.
 * 
 * Analogy: Think of a library.
 * - Embeddings = books on shelves
 * - Index = the card catalog that helps you find books quickly
 * 
 * Without an index: Check every book (O(n) - slow)
 * With an index: Jump to relevant section (much faster)
 * 
 * For our ~2,361 chunks, brute force O(n) search is actually fine.
 * But we still structure the data for efficient loading and searching.
 * 
 * INDEX TYPES (for interview knowledge):
 * - Brute Force: Compare all vectors. Simple. Best for <10K vectors.
 * - HNSW: Graph-based. O(log n). Used by Pinecone, Qdrant.
 * - IVF: Clusters vectors. O(√n). Used by FAISS.
 * 
 * We use brute force because:
 * 1. Simple to implement and understand
 * 2. 100% accurate (no approximation)
 * 3. Fast enough for 2,361 chunks (~1ms per search)
 * 
 * FILE STRUCTURE:
 * - index-vectors.bin: Raw binary vectors (compact, fast to load)
 * - index-metadata.json: Human-readable metadata (ids, text, sources)
 * 
 * ============================================================================
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Input: embeddings from Step 3
  inputFile: './output/embeddings.json',
  
  // Output: index files
  vectorsFile: './output/index-vectors.bin',
  metadataFile: './output/index-metadata.json',
  
  // Dimensions (must match embedding model)
  dimensions: 384
};

// ============================================================================
// MAIN INDEXING FUNCTION
// ============================================================================

async function buildIndex() {
  console.log('📦 Building vector index...\n');
  
  const startTime = Date.now();
  
  // -------------------------------------------------------------------------
  // Step 1: Load embeddings from Step 3
  // -------------------------------------------------------------------------
  console.log('📖 Loading embeddings...');
  
  const embeddingsPath = path.resolve(CONFIG.inputFile);
  const embeddingsData = JSON.parse(await fs.readFile(embeddingsPath, 'utf-8'));
  const embeddings = embeddingsData.embeddings;
  
  console.log(`   Found ${embeddings.length} embeddings`);
  console.log(`   Dimensions: ${embeddingsData.dimensions}\n`);
  
  // -------------------------------------------------------------------------
  // Step 2: Create binary vector file
  // -------------------------------------------------------------------------
  // Why binary?
  // - JSON stores numbers as text: "0.123456" = 8 bytes
  // - Binary stores as Float32: 4 bytes
  // - Result: ~50% smaller file, faster to load
  
  console.log('🔧 Creating binary vector file...');
  
  // Calculate total size: numVectors × dimensions × 4 bytes per float
  const numVectors = embeddings.length;
  const dimensions = embeddingsData.dimensions;
  const bufferSize = numVectors * dimensions * 4; // 4 bytes per Float32
  
  // Create a buffer to hold all vectors
  const buffer = Buffer.alloc(bufferSize);
  
  // Pack vectors into buffer
  for (let i = 0; i < numVectors; i++) {
    const vector = embeddings[i].embedding;
    for (let j = 0; j < dimensions; j++) {
      // Write each float at the correct position
      buffer.writeFloatLE(vector[j], (i * dimensions + j) * 4);
    }
    
    // Progress every 500 vectors
    if ((i + 1) % 500 === 0) {
      process.stdout.write(`\r   Packing vectors: ${i + 1}/${numVectors}`);
    }
  }
  console.log(`\r   Packed ${numVectors} vectors into binary format    \n`);
  
  // Write binary file
  const vectorsPath = path.resolve(CONFIG.vectorsFile);
  await fs.writeFile(vectorsPath, buffer);
  
  // -------------------------------------------------------------------------
  // Step 3: Create metadata file
  // -------------------------------------------------------------------------
  // Metadata is kept separate so vectors can be loaded into memory efficiently
  // Later, when a search returns vector index 42, we look up metadata[42]
  
  console.log('📝 Creating metadata file...');
  
  const metadata = {
    createdAt: new Date().toISOString(),
    model: embeddingsData.model,
    dimensions: dimensions,
    numVectors: numVectors,
    
    // Array of metadata for each vector (same order as binary file)
    items: embeddings.map((e, idx) => ({
      index: idx,           // Position in binary file
      id: e.id,             // Chunk ID from earlier steps
      text: e.text,         // Original text (for display)
      metadata: e.metadata  // Source file, page number, etc.
    }))
  };
  
  const metadataPath = path.resolve(CONFIG.metadataFile);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  
  // -------------------------------------------------------------------------
  // Step 4: Show summary
  // -------------------------------------------------------------------------
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  const vectorsSize = (await fs.stat(vectorsPath)).size;
  const metadataSize = (await fs.stat(metadataPath)).size;
  const originalSize = (await fs.stat(embeddingsPath)).size;
  
  console.log('\n📊 INDEX BUILD COMPLETE!\n');
  console.log('┌───────────────────────────────────────────────────┐');
  console.log(`│ Vectors Indexed:    ${numVectors.toString().padStart(28)} │`);
  console.log(`│ Dimensions:         ${dimensions.toString().padStart(28)} │`);
  console.log(`│ Build Time:         ${(totalTime + 's').padStart(28)} │`);
  console.log('├───────────────────────────────────────────────────┤');
  console.log(`│ Original (JSON):    ${formatBytes(originalSize).padStart(28)} │`);
  console.log(`│ Vectors (Binary):   ${formatBytes(vectorsSize).padStart(28)} │`);
  console.log(`│ Metadata (JSON):    ${formatBytes(metadataSize).padStart(28)} │`);
  console.log(`│ Total Index:        ${formatBytes(vectorsSize + metadataSize).padStart(28)} │`);
  console.log('└───────────────────────────────────────────────────┘');
  
  console.log('\n📁 Output files:');
  console.log(`   ${vectorsPath}`);
  console.log(`   ${metadataPath}`);
  
  // -------------------------------------------------------------------------
  // Verification: Spot-check one vector
  // -------------------------------------------------------------------------
  console.log('\n🔍 Verification (reading back first vector):');
  
  // Read back from binary file
  const readBuffer = await fs.readFile(vectorsPath);
  const firstVector = [];
  for (let i = 0; i < 5; i++) {
    firstVector.push(readBuffer.readFloatLE(i * 4));
  }
  
  console.log(`   Original: [${embeddings[0].embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}, ...]`);
  console.log(`   From bin: [${firstVector.map(n => n.toFixed(4)).join(', ')}, ...]`);
  console.log(`   Match: ${firstVector.every((v, i) => Math.abs(v - embeddings[0].embedding[i]) < 0.0001) ? '✅ YES' : '❌ NO'}`);
  
  // -------------------------------------------------------------------------
  // Show how to use in backend
  // -------------------------------------------------------------------------
  console.log('\n📝 Usage in backend:');
  console.log('   1. Load vectors: Buffer.from(fs.readFileSync("index-vectors.bin"))');
  console.log('   2. Load metadata: JSON.parse(fs.readFileSync("index-metadata.json"))');
  console.log('   3. For query vector Q, compute dot product with each stored vector');
  console.log('   4. Return top-K metadata items by similarity score');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================================================
// RUN
// ============================================================================

buildIndex().catch(console.error);
