# PR-DEMO-07 Issues Analysis

## Issues Reported by User

### Issue #1: `npx vite --port 5173 --strictPort` không chạy server
- **Status**: ❌ Confirmed
- **Root Cause**: `npx vite` không tìm node_modules đúng cách
- **Solution**: Use `pnpm dev` or `npm run dev` instead
- **Notes**: vite.config.ts now uses proper ES module __dirname resolution

### Issue #2: Menu "Column Sizing" - nội dung demo không đúng
- **Status**: ✅ Fixed
- **Root Cause**: meta.ts nói về "Column Resizing" nhưng Demo.tsx chỉ demo "Column Sizing"
- **Solution**: Updated meta.ts to match Demo.tsx content
  - Changed learningOutcomes to focus on column sizing, not resizing
  - Updated notes section to match actual demo
  - Fixed keywords and description
- **Changes**: 
  - Removed references to `resizable: true`, minWidth, maxWidth
  - Added column formatting, alignment, and proportion patterns
  - Updated notes with realistic examples matching demo

### Issue #3: "Advanced Query Patterns" - tự động nhảy về "Basic Table"
- **Status**: 🔍 Investigating
- **Root Cause**: Unknown - need to check routing via console logs
- **Debugging**: Added console.log statements to App.tsx and AppShell.tsx
- **Expected**: Hash should be set to "advanced-query" when clicked
- **Test**: Check browser console logs when clicking demo 08

### Issue #4: Phần header "v0.1.0 Progressive Demos" - không đúng hiện trạng
- **Status**: ✅ Fixed
- **Root Cause**: vite.config.ts used `__dirname` which doesn't work in ES modules
- **Solution**: Updated vite.config.ts to use fileURLToPath and import.meta.url
- **Code**:
  ```typescript
  import { fileURLToPath } from 'url';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  ```
- **Result**: Version should now be properly injected from package.json

## Changes Made

### File: packages/demo/vite.config.ts
- Fixed ES module compatibility for __dirname
- Added fileURLToPath for proper path resolution
- Version injection should now work correctly

### File: packages/demo/src/demos/07-column-resize/meta.ts
- Completely rewrote to match actual Demo.tsx implementation
- Fixed learningOutcomes
- Fixed notes section with proper patterns
- Updated keywords

### File: packages/demo/src/app/version.ts
- Added debug console.log statements

### File: packages/demo/src/app/AppShell.tsx
- Added console.log for version debugging

### File: packages/demo/src/App.tsx
- Added console.log for routing debugging

## Next Steps

1. Check browser console logs for version injection
2. Test clicking "Advanced Query Patterns" and observe console logs
3. Verify header displays correct version
4. If routing issue persists, investigate getDemoBySlug()
