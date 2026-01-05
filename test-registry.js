// Test script to verify the demo registry structure
const fs = require('fs');
const path = require('path');

// Read the registry file
const registryPath = path.join(__dirname, 'packages/demo/src/app/demoRegistry.ts');
const content = fs.readFileSync(registryPath, 'utf-8');

// Extract all slug values
const slugMatches = content.match(/slug:\s*['"`]([^'"`]+)['"`]/g);
const slugs = slugMatches ? slugMatches.map(m => m.match(/['"`]([^'"`]+)['"`]/)[1]) : [];

console.log('=== Demo Registry Validation ===');
console.log(`Total slugs found: ${slugs.length}`);
console.log('Slugs:', slugs);

// Expected slugs
const expected = [
  'basic-usage',
  'columns-formatting', 
  'row-actions',
  'server-filters',
  'url-sync',
  'saved-views',
  'column-resize',
  'advanced-query'
];

console.log('\nValidation:');
for (const slug of expected) {
  if (slugs.includes(slug)) {
    console.log(`✓ ${slug}`);
  } else {
    console.log(`✗ ${slug} - MISSING`);
  }
}

// Check for duplicates
const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (duplicates.length > 0) {
  console.log('\n⚠ Duplicate slugs:', [...new Set(duplicates)]);
} else {
  console.log('\n✓ No duplicate slugs');
}
