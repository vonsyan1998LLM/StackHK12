const fs = require('fs');
const path = require('path');

// Read template files
const headerTemplate = fs.readFileSync(path.join(__dirname, '../templates/header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(__dirname, '../templates/footer.html'), 'utf8');

// Read page skeleton files
const pagesDir = path.join(__dirname, '../pages');
const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));

// Prepare data for KV write
const kvData = {
  'template:header': headerTemplate,
  'template:footer': footerTemplate,
};

// Add page skeletons
pageFiles.forEach(file => {
  const pageName = file.replace('.html', '');
  const pageContent = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  kvData[`page:${pageName}`] = pageContent;
});

// Output JSON for manual import or API call
console.log(JSON.stringify(kvData, null, 2));

// Example curl commands for data import
console.log('\n# Example curl commands to import data:');
console.log('# Deploy the Worker first, then use:');
Object.entries(kvData).forEach(([key, value]) => {
  console.log(`curl -X POST https://your-worker-url.workers.dev/api/templates -H "Content-Type: application/json" -d '{"key":"${key.replace('template:', '')}","content":${JSON.stringify(value)}}'`);
});