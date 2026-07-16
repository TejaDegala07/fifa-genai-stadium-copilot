const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove `, isUsingMock` or `isUsingMock, ` from useAI destructing
  content = content.replace(/,\s*isUsingMock\s*}/g, ' }');
  content = content.replace(/\{\s*isUsingMock\s*,/g, '{ ');
  
  // Remove `isUsingMock={isUsingMock}`
  content = content.replace(/\s*isUsingMock=\{isUsingMock\}/g, '');
  
  fs.writeFileSync(filePath, content);
}
console.log('Removed isUsingMock from pages');
