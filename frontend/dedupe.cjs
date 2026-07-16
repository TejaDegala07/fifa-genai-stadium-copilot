const fs = require('fs');

const content = fs.readFileSync('src/i18n/translations.ts', 'utf-8');
const lines = content.split('\n');

const outLines = [];
const seenKeys = new Set();
let currentLang = '';

for (let line of lines) {
  // Detect language block reset
  if (line.match(/^const \w+: Translations = {/)) {
    seenKeys.clear();
    outLines.push(line);
    continue;
  }
  
  // Detect key line like: `  'alert.dismiss': 'Dismiss',`
  const match = line.match(/^\s*'([^']+)'\s*:/);
  if (match) {
    const key = match[1];
    if (seenKeys.has(key)) {
      // Duplicate, skip it
      continue;
    }
    seenKeys.add(key);
  }
  
  outLines.push(line);
}

fs.writeFileSync('src/i18n/translations.ts', outLines.join('\n'));
console.log('Deduplication complete.');
