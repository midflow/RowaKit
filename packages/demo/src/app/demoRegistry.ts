/**
 * Demo Registry - All 13 progressive demos
 * Structure: 01-basic → 02-columns → 03-row-actions → 04-server-filters → 
 *            05-url-sync → 06-saved-views → 07-column-resize → 08-advanced-query →
 *            09-row-selection → 10-bulk-actions → 11-csv-export →
 *            12-multi-sort → 13-accessibility
 */

import BasicUsageDemo from '../demos/01-basic/Demo';
import ColumnsFormattingDemo from '../demos/02-columns-formatting/Demo';
import RowActionsDemo from '../demos/03-row-actions/Demo';
import ServerFiltersDemo from '../demos/04-server-filters/Demo';
import UrlSyncDemo from '../demos/05-url-sync/Demo';
import SavedViewsDemo from '../demos/06-saved-views/Demo';
import ColumnResizeDemo from '../demos/07-column-resize/Demo';
import AdvancedQueryDemo from '../demos/08-advanced-query/Demo';
import RowSelectionDemo from '../demos/09-row-selection/Demo';
import BulkActionsDemo from '../demos/10-bulk-actions/Demo';
import CsvExportDemo from '../demos/11-csv-export/Demo';
import MultiSortDemo from '../demos/12-multi-sort/Demo';
import AccessibilityDemo from '../demos/13-accessibility/Demo';
import QueryToolbarDemo from '../demos/12-query-toolbar/Demo';
import ActionBarDemo from '../demos/13-action-bar/Demo';
import ToolkitCombinedDemo from '../demos/14-toolkit-combined/Demo';

// Demo metadata (contains learning outcomes and documentation)
import { meta as basicMeta } from '../demos/01-basic/meta';
import { meta as columnsMeta } from '../demos/02-columns-formatting/meta';
import { meta as actionsMeta } from '../demos/03-row-actions/meta';
import { meta as filtersMeta } from '../demos/04-server-filters/meta';
import { meta as urlSyncMeta } from '../demos/05-url-sync/meta';
import { meta as viewsMeta } from '../demos/06-saved-views/meta';
import { meta as resizeMeta } from '../demos/07-column-resize/meta';
import { meta as advancedMeta } from '../demos/08-advanced-query/meta';
import { meta as selectionMeta } from '../demos/09-row-selection/meta';
import { meta as bulkActionsMeta } from '../demos/10-bulk-actions/meta';
import { meta as csvExportMeta } from '../demos/11-csv-export/meta';
import { meta as multiSortMeta } from '../demos/12-multi-sort/meta';
import { meta as a11yMeta } from '../demos/13-accessibility/meta';
import { meta as queryToolbarMeta } from '../demos/12-query-toolbar/meta';
import { meta as actionBarMeta } from '../demos/13-action-bar/meta';
import { meta as toolkitCombinedMeta } from '../demos/14-toolkit-combined/meta';

// Import raw code snippets from Code.tsx files (using Vite ?raw query)
import basicCode from '../demos/01-basic/Code.tsx?raw';
import columnsCode from '../demos/02-columns-formatting/Code.tsx?raw';
import actionsCode from '../demos/03-row-actions/Code.tsx?raw';
import filtersCode from '../demos/04-server-filters/Code.tsx?raw';
import urlSyncCode from '../demos/05-url-sync/Code.tsx?raw';
import viewsCode from '../demos/06-saved-views/Code.tsx?raw';
import resizeCode from '../demos/07-column-resize/Code.tsx?raw';
import advancedCode from '../demos/08-advanced-query/Code.tsx?raw';
import selectionCode from '../demos/09-row-selection/Code.tsx?raw';
import bulkActionsCode from '../demos/10-bulk-actions/Code.tsx?raw';
import csvExportCode from '../demos/11-csv-export/Code.tsx?raw';
import multiSortCode from '../demos/12-multi-sort/Code.tsx?raw';
import a11yCode from '../demos/13-accessibility/Code.tsx?raw';
import queryToolbarCode from '../demos/12-query-toolbar/Code.tsx?raw';
import actionBarCode from '../demos/13-action-bar/Code.tsx?raw';
import toolkitCombinedCode from '../demos/14-toolkit-combined/Code.tsx?raw';

/**
 * DemoMeta interface with learning outcomes and documentation
 */
export interface DemoMeta {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keywords: string[];
  learningOutcomes: string[];
  notes: string; // Markdown
  nextSteps?: string;
}

/**
 * Demo configuration for sidebar and routing
 */
export interface DemoConfig extends DemoMeta {
  slug: string;
  category: 'getting-started' | 'real-world' | 'advanced' | 'stage-e';
  component: React.ComponentType;
  code: string; // ✅ Raw code string loaded from Code.tsx
  tags?: string[];
}

/**
 * Demo Registry - all 8 progressive demos
 */
export const DEMO_REGISTRY: DemoConfig[] = [
  {
    id: '01-basic',
    ...basicMeta,
    slug: 'basic-usage',
    category: 'getting-started',
    component: BasicUsageDemo,
    code: basicCode,
    tags: ['pagination', 'sorting', 'intro'],
  } as DemoConfig,
  {
    id: '02-columns-formatting',
    ...columnsMeta,
    slug: 'columns-formatting',
    category: 'getting-started',
    component: ColumnsFormattingDemo,
    code: columnsCode,
    tags: ['columns', 'formatting'],
  } as DemoConfig,
  {
    id: '03-row-actions',
    ...actionsMeta,
    slug: 'row-actions',
    category: 'getting-started',
    component: RowActionsDemo,
    code: actionsCode,
    tags: ['actions', 'events'],
  } as DemoConfig,
  {
    id: '04-server-filters',
    ...filtersMeta,
    slug: 'server-filters',
    category: 'real-world',
    component: ServerFiltersDemo,
    code: filtersCode,
    tags: ['filters', 'search'],
  } as DemoConfig,
  {
    id: '05-url-sync',
    ...urlSyncMeta,
    slug: 'url-sync',
    category: 'real-world',
    component: UrlSyncDemo,
    code: urlSyncCode,
    tags: ['url', 'sharing'],
  } as DemoConfig,
  {
    id: '06-saved-views',
    ...viewsMeta,
    slug: 'saved-views',
    category: 'real-world',
    component: SavedViewsDemo,
    code: viewsCode,
    tags: ['storage', 'views'],
  } as DemoConfig,
  {
    ...resizeMeta,
    slug: 'column-resize',
    category: 'advanced',
    component: ColumnResizeDemo,
    code: resizeCode,
    tags: ['columns', 'ui'],
  } as DemoConfig,
  {
    ...advancedMeta,
    slug: 'advanced-query',
    category: 'advanced',
    component: AdvancedQueryDemo,
    code: advancedCode,
    tags: ['advanced', 'combo'],
  } as DemoConfig,
  {
    id: '09-row-selection',
    ...selectionMeta,
    slug: 'row-selection',
    category: 'stage-e',
    component: RowSelectionDemo,
    code: selectionCode,
    tags: ['selection', 'workflow'],
  } as DemoConfig,
  {
    id: '10-bulk-actions',
    ...bulkActionsMeta,
    slug: 'bulk-actions',
    category: 'stage-e',
    component: BulkActionsDemo,
    code: bulkActionsCode,
    tags: ['bulk', 'actions'],
  } as DemoConfig,
  {
    id: '11-csv-export',
    ...csvExportMeta,
    slug: 'csv-export',
    category: 'stage-e',
    component: CsvExportDemo,
    code: csvExportCode,
    tags: ['export', 'download'],
  } as DemoConfig,
  {
    id: '12-multi-sort',
    ...multiSortMeta,
    slug: 'multi-sort',
    category: 'stage-e',
    component: MultiSortDemo,
    code: multiSortCode,
    tags: ['sorting', 'advanced'],
  } as DemoConfig,
  {
    id: '13-accessibility',
    ...a11yMeta,
    slug: 'accessibility',
    category: 'stage-e',
    component: AccessibilityDemo,
    code: a11yCode,
    tags: ['a11y', 'keyboard'],
  } as DemoConfig,
  {
    ...queryToolbarMeta,
    slug: 'query-toolbar',
    category: 'stage-e',
    component: QueryToolbarDemo,
    code: queryToolbarCode,
    tags: ['toolkit', 'search', 'filters'],
  } as DemoConfig,
  {
    ...actionBarMeta,
    slug: 'action-bar',
    category: 'stage-e',
    component: ActionBarDemo,
    code: actionBarCode,
    tags: ['toolkit', 'selection', 'bulk-actions'],
  } as DemoConfig,
  {
    ...toolkitCombinedMeta,
    slug: 'toolkit-combined',
    category: 'stage-e',
    component: ToolkitCombinedDemo,
    code: toolkitCombinedCode,
    tags: ['toolkit', 'integration', 'complete'],
  } as DemoConfig,
];

/**
 * Get demo by slug
 */
export function getDemoBySlug(slug: string): DemoConfig | undefined {
  return DEMO_REGISTRY.find((d) => d.slug === slug);
}

/**
 * Get demos by category
 */
export function getDemosByCategory(category: DemoConfig['category']): DemoConfig[] {
  return DEMO_REGISTRY.filter((d) => d.category === category);
}

/**
 * Get all unique categories with demo count
 */
export function getDemoCategories(): Array<{
  id: DemoConfig['category'];
  label: string;
  count: number;
}> {
  const categories: Record<DemoConfig['category'], string> = {
    'getting-started': 'Getting Started',
    'real-world': 'Real-world Examples',
    'advanced': 'Advanced',
    'stage-e': 'Stage E (v0.5.0)',
  };

  return Object.entries(categories).map(([id, label]) => ({
    id: id as DemoConfig['category'],
    label,
    count: DEMO_REGISTRY.filter((d) => d.category === id).length,
  }));
}

/**
 * Get first demo (default on load)
 */
export function getFirstDemo(): DemoConfig {
  return DEMO_REGISTRY[0];
}

/**
 * Validate demo completeness
 * Returns missing fields/issues for a demo
 */
export function validateDemoCompleteness(demo: DemoConfig): {
  isComplete: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];

  // Check required fields
  if (!demo.id) missing.push('id');
  if (!demo.title) missing.push('title');
  if (!demo.description) missing.push('description');
  if (!demo.slug) missing.push('slug');
  if (!demo.category) missing.push('category');
  if (!demo.component) missing.push('component');
  if (!demo.code || demo.code.length === 0) missing.push('code');
  if (!Array.isArray(demo.learningOutcomes) || demo.learningOutcomes.length === 0)
    missing.push('learningOutcomes');
  if (!demo.notes || demo.notes.length === 0) missing.push('notes');

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Get all demos with completeness status
 */
export function getDemosWithCompleteness(): Array<DemoConfig & { isComplete: boolean }> {
  return DEMO_REGISTRY.map((demo) => ({
    ...demo,
    isComplete: validateDemoCompleteness(demo).isComplete,
  }));
}
