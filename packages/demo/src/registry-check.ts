// Quick check of the demo registry structure
import { DEMO_REGISTRY, getDemoBySlug, getDemoCategories } from '../src/app/demoRegistry.ts';

console.log('=== Demo Registry Verification ===\n');

console.log('Total demos:', DEMO_REGISTRY.length);
console.log('\nAll demos:');
DEMO_REGISTRY.forEach((demo, i) => {
  console.log(`${i + 1}. ID: ${demo.id}, Slug: ${demo.slug}, Category: ${demo.category}, Title: ${demo.title}`);
});

console.log('\n=== Category Breakdown ===');
const categories = getDemoCategories();
categories.forEach(cat => {
  console.log(`${cat.label} (${cat.count} demos):`);
  const demos = DEMO_REGISTRY.filter(d => d.category === cat.id);
  demos.forEach(demo => {
    console.log(`  - ${demo.title} (${demo.slug})`);
  });
});

console.log('\n=== Slug Lookup Test ===');
const testSlugs = ['basic-usage', 'url-sync', 'advanced-query', 'non-existent'];
testSlugs.forEach(slug => {
  const demo = getDemoBySlug(slug);
  console.log(`Slug "${slug}": ${demo ? `FOUND - ${demo.title}` : 'NOT FOUND'}`);
});
