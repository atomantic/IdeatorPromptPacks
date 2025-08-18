#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKS_DIR = path.join(__dirname, 'packs');
const PACKS_JSON_PATH = path.join(__dirname, 'packs.json');

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Normalize TSV file:
// - Capitalize first letter of text
// - Ensure exactly 1 or 2 columns: text[\thelp]
// - If a line looks like: "Text  (help)" without a tab, split into columns
// - If more than 2 columns, collapse extras into help
function normalizeTsvFile(tsvFilePath) {
  const content = fs.readFileSync(tsvFilePath, 'utf-8');
  const rawLines = content.split('\n');
  if (rawLines.length === 0) return { hasHelp: false };

  const header = rawLines[0].trim();
  const lines = rawLines.slice(1); // data lines (may include empties)

  let anyHelp = false;
  const normalized = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line === '') continue; // drop empty lines

    let parts = line.split('\t');
    if (parts.length === 1) {
      // Try to detect appended help in parentheses at end: "Text (help)"
      const m = line.match(/^(.*?)[\s]*\(([^)]*)\)$/);
      if (m) {
        const text = capitalizeFirst(m[1].trim());
        const help = `(${m[2].trim()})`;
        anyHelp = true;
        normalized.push([text, help]);
        continue;
      } else {
        const text = capitalizeFirst(parts[0].trim());
        normalized.push([text]);
        continue;
      }
    }

    // If more than 2 columns, collapse extras into help
    if (parts.length > 2) {
      const text = capitalizeFirst(parts[0].trim());
      const help = parts.slice(1).join(' ').trim();
      if (help) anyHelp = true;
      normalized.push(help ? [text, help] : [text]);
      continue;
    }

    // Exactly 2 columns
    const text = capitalizeFirst(parts[0].trim());
    const help = (parts[1] || '').trim();
    if (help) anyHelp = true;
    normalized.push(help ? [text, help] : [text]);
  }

  // Determine header based on whether any help exists
  const outHeader = anyHelp ? 'text\thelp' : 'text';
  const outLines = [outHeader, ...normalized.map(cols => cols.join('\t'))];
  fs.writeFileSync(tsvFilePath, outLines.join('\n') + '\n', 'utf-8');

  return { hasHelp: anyHelp };
}

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

  const header = lines[0];
  const dataLines = lines.slice(1);
  dataLines.sort((a, b) => {
    const [aText] = a.split('\t');
    const [bText] = b.split('\t');
    return (aText || '').toLowerCase().localeCompare((bText || '').toLowerCase());
  });

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

  // Check header allows either v1 or v2
  const header = lines[0].trim();
  if (header !== 'text' && header !== 'text\thelp') {
    return { valid: false, error: `Invalid header: "${header}" (expected "text" or "text\thelp")` };
  }

  // Validate rows
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.trim() === '') {
      return { valid: false, error: `Empty line found at line ${i + 1}` };
    }
    const cols = row.split('\t');
    if (header === 'text' && cols.length !== 1) {
      return { valid: false, error: `Line ${i + 1}: expected 1 column, found ${cols.length}` };
    }
    if (header === 'text\thelp' && cols.length !== 2) {
      return { valid: false, error: `Line ${i + 1}: expected 2 columns, found ${cols.length}` };
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
    
    // Normalize and validate all TSV files in the pack
    const tsvFiles = fs.readdirSync(packPath).filter(file => file.endsWith('.tsv'));
    let packValid = true;

    for (const tsvFile of tsvFiles) {
      const tsvPath = path.join(packPath, tsvFile);
      // Normalize: capitalization + columns
      const normInfo = normalizeTsvFile(tsvPath);
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
