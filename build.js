#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, 'packs');
const PACKS_JSON_PATH = path.join(__dirname, 'packs.json');

function countPrompts(tsvFilePath) {
  const content = fs.readFileSync(tsvFilePath, 'utf-8');
  const lines = content.trim().split('\n');
  // First line is header, so we subtract 1
  return Math.max(0, lines.length - 1);
}

function getPackInfo(packDir) {
  const manifestPath = path.join(packDir, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.warn(`Warning: No manifest.json found in ${packDir}`);
    return null;
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  // Count prompts from all TSV files
  let totalPrompts = 0;
  const tsvFiles = fs.readdirSync(packDir).filter(file => file.endsWith('.tsv'));
  
  for (const tsvFile of tsvFiles) {
    const count = countPrompts(path.join(packDir, tsvFile));
    console.log(`  ${tsvFile}: ${count} prompts`);
    totalPrompts += count;
  }
  
  // Extract category names from manifest
  const categories = (manifest.categories ?
    manifest.categories.map(cat => cat.name || cat.id) :
    tsvFiles.map(file => path.basename(file, '.tsv'))
  ).sort((a, b) => a.localeCompare(b));

  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version || "1.0.0",
    description: manifest.description,
    author: manifest.author || "Idea Loom",
    downloadUrl: `https://raw.githubusercontent.com/atomantic/IdeatorPromptPacks/main/packs/${manifest.id}/`,
    promptCount: totalPrompts,
    categories: categories
  };
}

function alphabetizeTsvFile(tsvFilePath) {
  const content = fs.readFileSync(tsvFilePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length <= 1) {
    return; // Nothing to alphabetize
  }
  
  // Keep header, sort the rest
  const header = lines[0];
  const dataLines = lines.slice(1);
  dataLines.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  // Write back to file
  const newContent = [header, ...dataLines].join('\n') + '\n';
  fs.writeFileSync(tsvFilePath, newContent, 'utf-8');
  console.log(`  Alphabetized ${path.basename(tsvFilePath)}`);
}

function validateTsvFormat(tsvFilePath) {
  const content = fs.readFileSync(tsvFilePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  // Check header
  const header = lines[0].trim();
  if (header !== 'text') {
    return { valid: false, error: `Invalid header: "${header}" (expected "text")` };
  }
  
  // Check for empty lines or malformed content
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      return { valid: false, error: `Empty line found at line ${i + 1}` };
    }
  }
  
  return { valid: true };
}

function buildPacksJson() {
  console.log('Building packs.json...\n');
  
  const packDirs = fs.readdirSync(PACKS_DIR).filter(dir => {
    const fullPath = path.join(PACKS_DIR, dir);
    return fs.statSync(fullPath).isDirectory();
  });
  
  const packs = [];
  let hasErrors = false;
  
  for (const packDir of packDirs) {
    console.log(`Processing pack: ${packDir}`);
    const packPath = path.join(PACKS_DIR, packDir);
    
    // Validate all TSV files in the pack
    const tsvFiles = fs.readdirSync(packPath).filter(file => file.endsWith('.tsv'));
    let packValid = true;
    
    for (const tsvFile of tsvFiles) {
      const tsvPath = path.join(packPath, tsvFile);
      const validation = validateTsvFormat(tsvPath);
      
      if (!validation.valid) {
        console.error(`  ERROR in ${tsvFile}: ${validation.error}`);
        hasErrors = true;
        packValid = false;
      } else {
        // Alphabetize valid TSV files
        alphabetizeTsvFile(tsvPath);
      }
    }
    
    if (packValid) {
      const packInfo = getPackInfo(packPath);
      if (packInfo) {
        packs.push(packInfo);
        console.log(`  Total prompts: ${packInfo.promptCount}`);
      }
    } else {
      console.log(`  Skipping pack due to validation errors`);
    }
    
    console.log('');
  }
  
  if (hasErrors) {
    console.error('\n❌ Build failed due to validation errors');
    process.exit(1);
  }
  
  // Sort packs by ID for consistency
  packs.sort((a, b) => a.id.localeCompare(b.id));
  
  // Write the updated packs.json
  fs.writeFileSync(PACKS_JSON_PATH, JSON.stringify(packs, null, 2) + '\n');
  
  console.log(`✅ Successfully built packs.json with ${packs.length} packs`);
  console.log(`Total prompts across all packs: ${packs.reduce((sum, pack) => sum + pack.promptCount, 0)}`);
}

// Run the build
buildPacksJson();