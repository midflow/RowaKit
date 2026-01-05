// Test script to verify all fixes
// This should be executed in browser console

console.log('=== RowaKit Demo Gallery - Test Suite ===');

// Test 1: Check version injection
console.log('\n[Test 1] Version Injection');
const versionText = document.querySelector('.sidebar-subtitle')?.textContent;
console.log('Version text:', versionText);
console.log('Expected format: v0.1.0 • Progressive Demos');
console.log('No "Stage" should appear:', !versionText.includes('Stage'));

// Test 2: Check all demos are listed
console.log('\n[Test 2] Demo Count');
const navItems = document.querySelectorAll('.nav-link');
console.log('Total demos in sidebar:', navItems.length);
console.log('Expected: 8');

// Test 3: Check demo titles
console.log('\n[Test 3] Demo Titles');
navItems.forEach((item, idx) => {
  const title = item.querySelector('.nav-link-title')?.textContent;
  console.log(`Demo ${idx + 1}:`, title);
});

// Test 4: Check current demo
console.log('\n[Test 4] Current Demo');
const pageTitle = document.querySelector('.demo-title')?.textContent;
console.log('Current demo title:', pageTitle);

// Test 5: Test routing
console.log('\n[Test 5] Routing Test');
console.log('Current hash:', window.location.hash);
const activeLink = document.querySelector('.nav-link.active');
console.log('Active nav item:', activeLink?.querySelector('.nav-link-title')?.textContent);

console.log('\n=== Tests Complete ===');
