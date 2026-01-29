/**
 * ============================================================
 * RAG PREPROCESSING - STEP 2: TEXT CHUNKING
 * ============================================================
 * 
 * WHAT THIS SCRIPT DOES:
 * ----------------------
 * 1. Reads the extracted.json from Step 1
 * 2. Splits text into semantically meaningful chunks
 * 3. Uses RecursiveCharacterTextSplitter (paragraph → sentence → word)
 * 4. Preserves metadata (filename, page number)
 * 5. Outputs chunks.json for Step 3 (embeddings)
 * 
 * WHY CHUNKING IS NEEDED:
 * -----------------------
 * - PDF pages are too large for embeddings (500+ words)
 * - LLMs have context limits
 * - Smaller chunks = more precise retrieval
 * - Overlap ensures context isn't lost at boundaries
 * 
 * INTERVIEW TIP:
 * --------------
 * "I use RecursiveCharacterTextSplitter because it respects
 * semantic boundaries - it tries paragraph breaks first, then
 * sentences, then words. This prevents breaking mid-thought,
 * which would hurt retrieval quality."
 * 
 * ============================================================
 */

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, "output", "extracted.json");
const OUTPUT_FILE = path.join(__dirname, "output", "chunks.json");

// Chunking configuration
// These values are optimized for RAG retrieval
const CHUNK_CONFIG = {
  chunkSize: 1500,      // ~200-400 words (depends on content)
  chunkOverlap: 200,    // ~2-3 sentences of overlap
  separators: ["\n\n", "\n", ". ", ", ", " ", ""], // Semantic priority
};

/**
 * Generate a unique ID for each chunk
 * Format: filename_page_chunkIndex
 */
function generateChunkId(filename, pageNumber, chunkIndex) {
  // Clean filename: remove extension, spaces, and special chars
  const cleanName = filename
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 20)
    .toLowerCase();
  
  return `${cleanName}_p${pageNumber}_c${chunkIndex}`;
}

/**
 * Main function to chunk all extracted text
 */
async function chunkText() {
  console.log("🔪 Starting text chunking...\n");

  // Step 1: Read the extracted JSON from Step 1
  if (!fs.existsSync(INPUT_FILE)) {
    console.error("❌ Error: extracted.json not found!");
    console.error("   Please run extract-pdf.js first (Step 1).");
    process.exit(1);
  }

  const extracted = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  console.log(`📚 Loaded ${extracted.totalDocuments} documents (${extracted.totalPages} pages)\n`);

  // Step 2: Initialize the text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_CONFIG.chunkSize,
    chunkOverlap: CHUNK_CONFIG.chunkOverlap,
    separators: CHUNK_CONFIG.separators,
  });

  // Step 3: Process each document and page
  const allChunks = [];
  let totalChunks = 0;

  for (const doc of extracted.documents) {
    console.log(`📖 Chunking: ${doc.filename}`);
    let docChunks = 0;

    for (const page of doc.pages) {
      // Skip empty pages
      if (!page.text || page.text.trim().length === 0) {
        continue;
      }

      // Split the page text into chunks
      const chunks = await splitter.splitText(page.text);

      // Create chunk objects with metadata
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i].trim();
        
        // Skip very small chunks (less than 50 chars)
        if (chunkText.length < 50) {
          continue;
        }

        allChunks.push({
          id: generateChunkId(doc.filename, page.pageNumber, i + 1),
          text: chunkText,
          metadata: {
            source: doc.filename,
            filepath: doc.filepath,
            pageNumber: page.pageNumber,
            chunkIndex: i + 1,
            totalChunksInPage: chunks.length,
          },
        });
        docChunks++;
      }
    }

    console.log(`   ✅ Created ${docChunks} chunks\n`);
    totalChunks += docChunks;
  }

  // Step 4: Create output structure
  const output = {
    chunkedAt: new Date().toISOString(),
    sourceFile: "extracted.json",
    totalChunks: allChunks.length,
    chunkConfig: CHUNK_CONFIG,
    chunks: allChunks,
  };

  // Step 5: Save to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  // Summary with statistics
  const avgChunkLength = Math.round(
    allChunks.reduce((sum, c) => sum + c.text.length, 0) / allChunks.length
  );
  const avgWordCount = Math.round(
    allChunks.reduce((sum, c) => sum + c.text.split(/\s+/).length, 0) / allChunks.length
  );

  console.log("═".repeat(50));
  console.log("✅ CHUNKING COMPLETE!");
  console.log("═".repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Total chunks created: ${allChunks.length}`);
  console.log(`   - Average chunk length: ${avgChunkLength} chars`);
  console.log(`   - Average word count: ${avgWordCount} words`);
  console.log(`   - Output saved to: ${OUTPUT_FILE}`);
  console.log("");
  console.log("📝 Next Step: Embeddings (not implemented yet)");
}

// Run the chunking
chunkText().catch(console.error);
