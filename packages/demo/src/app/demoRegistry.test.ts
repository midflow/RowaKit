import { describe, it, expect } from 'vitest';
import { DEMO_REGISTRY, validateDemoCompleteness, getDemosWithCompleteness } from './demoRegistry';

describe('demoRegistry', () => {
  it('should have exactly 8 demos', () => {
    expect(DEMO_REGISTRY).toHaveLength(8);
  });

  it('all demos should have non-empty code snippets', () => {
    DEMO_REGISTRY.forEach((demo) => {
      expect(demo.code).toBeDefined();
      expect(typeof demo.code).toBe('string');
      expect(demo.code.length).toBeGreaterThan(0);
      expect(demo.code).not.toContain('// Failed to load');
      expect(demo.code).not.toContain('// See Demo.tsx');
    });
  });

  it('all demos should have required meta fields', () => {
    DEMO_REGISTRY.forEach((demo) => {
      expect(demo.id).toBeDefined();
      expect(demo.title).toBeDefined();
      expect(demo.description).toBeDefined();
      expect(demo.slug).toBeDefined();
      expect(demo.category).toBeDefined();
      expect(demo.component).toBeDefined();
      expect(demo.learningOutcomes).toBeDefined();
      expect(Array.isArray(demo.learningOutcomes)).toBe(true);
      expect(demo.learningOutcomes.length).toBeGreaterThan(0);
    });
  });

  it('all demos should have unique slugs', () => {
    const slugs = DEMO_REGISTRY.map((d) => d.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(DEMO_REGISTRY.length);
  });

  it('all demos should have a valid category', () => {
    const validCategories = ['getting-started', 'real-world', 'advanced'];
    DEMO_REGISTRY.forEach((demo) => {
      expect(validCategories).toContain(demo.category);
    });
  });
});

describe('demo completeness validation', () => {
  it('should validate all demos as complete', () => {
    DEMO_REGISTRY.forEach((demo) => {
      const completeness = validateDemoCompleteness(demo);
      expect(completeness.isComplete).toBe(true);
      expect(completeness.missingFields).toHaveLength(0);
    });
  });

  it('getDemosWithCompleteness should mark all as complete', () => {
    const demosWithStatus = getDemosWithCompleteness();
    expect(demosWithStatus).toHaveLength(8);
    demosWithStatus.forEach((demo) => {
      expect(demo.isComplete).toBe(true);
    });
  });

  it('validateDemoCompleteness should detect missing fields', () => {
    const incompleteDemos = {
      id: '01-test',
      title: 'Test',
      description: 'Test',
      slug: 'test',
      category: 'getting-started' as const,
      component: () => null,
      code: '', // empty code
      learningOutcomes: [], // empty outcomes
      notes: '',
      tags: [],
      difficulty: 'beginner' as const,
      keywords: [],
    };

    const result = validateDemoCompleteness(incompleteDemos);
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain('code');
    expect(result.missingFields).toContain('learningOutcomes');
    expect(result.missingFields).toContain('notes');
  });
});
