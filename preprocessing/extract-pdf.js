/**
 * ============================================================
 * RAG PREPROCESSING - STEP 1: PDF TEXT EXTRACTION
 * ============================================================
 * 
 * WHAT THIS SCRIPT DOES:
 * ----------------------
 * 1. Reads all PDF files from the "../books/" folder
 * 2. Uses LangChain's PDFLoader to extract text page-by-page
 * 3. Preserves metadata (filename, filepath, page number)
 * 4. Outputs structured JSON to "output/extracted.json"
 * 
 * WHY WE NEED THIS:
 * -----------------
 * PDFs store text in a complex format. Before we can search
 * through our competitive programming books, we need to:
 * - Extract the raw text content
 * - Know WHERE each piece of text came from (for citations)
 * 
 * INTERVIEW TIP:
 * --------------
 * "In RAG systems, the first step is document loading. We use
 * LangChain's PDFLoader because it's an industry standard that
 * automatically handles page-by-page extraction with metadata."
 * 
 * ============================================================
 */

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BOOKS_DIR = path.join(__dirname, "..", "books");
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "extracted.json");

/**
 * Main function to extract text from all PDFs
 */
async function extractPDFs() {
  console.log("🚀 Starting PDF extraction...\n");

  // Step 1: Get all PDF files from books folder
  const pdfFiles = fs.readdirSync(BOOKS_DIR).filter((file) => file.toLowerCase().endsWith(".pdf"));

  console.log(`📚 Found ${pdfFiles.length} PDF files:\n`);
  pdfFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log("");

  // Step 2: Process each PDF
  const documents = [];
  let totalPages = 0;

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(BOOKS_DIR, pdfFile);
    console.log(`📖 Processing: ${pdfFile}...`);

    try {
      // Use LangChain's PDFLoader to extract text
      // splitPages: true means we get one document per page
      const loader = new PDFLoader(filePath, {
        splitPages: true,
      });

      // Load and extract all pages
      const pages = await loader.load();

      console.log(`   ✅ Extracted ${pages.length} pages\n`);

      // Structure the data with metadata
      const documentData = {
        filename: pdfFile,
        filepath: filePath,
        totalPages: pages.length,
        pages: pages.map((page, index) => ({
          pageNumber: index + 1,
          text: page.pageContent,
          // LangChain also provides metadata we can use
          metadata: page.metadata,
        })),
      };

      documents.push(documentData);
      totalPages += pages.length;
    } catch (error) {
      console.error(`   ❌ Error processing ${pdfFile}: ${error.message}\n`);
    }
  }

  // Step 3: Create output structure
  const output = {
    extractedAt: new Date().toISOString(),
    totalDocuments: documents.length,
    totalPages: totalPages,
    documents: documents,
  };

  // Step 4: Save to JSON file
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  // Summary
  console.log("═".repeat(50));
  console.log("✅ EXTRACTION COMPLETE!");
  console.log("═".repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   - Documents processed: ${documents.length}`);
  console.log(`   - Total pages extracted: ${totalPages}`);
  console.log(`   - Output saved to: ${OUTPUT_FILE}`);
  console.log("");
  console.log("📝 Next Step: Chunking (not implemented yet)");
}

// Run the extraction
extractPDFs().catch(console.error);
