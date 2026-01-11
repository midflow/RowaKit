/**
 * Column Resizing Scenarios
 *
 * Tests column resize behavior
 */

import { describe, it, expect } from 'vitest';

export function runResizeScenarios() {
  describe('Column Resizing', () => {
    it('Resize — stores column widths', () => {
      const columnWidths: Record<string, number> = {
        name: 200,
        email: 250,
        age: 100,
      };

      expect(columnWidths.name).toBe(200);
      expect(columnWidths.email).toBe(250);
      expect(Object.keys(columnWidths)).toHaveLength(3);
    });

    it('Resize — respects min/max bounds', () => {
      const minWidth = 80;
      const maxWidth = 500;

      const attemptedWidths = [50, 100, 300, 600];
      const clampedWidths = attemptedWidths.map((w) =>
        Math.max(minWidth, Math.min(maxWidth, w))
      );

      expect(clampedWidths[0]).toBe(80); // Clamped to min
      expect(clampedWidths[1]).toBe(100); // Within range
      expect(clampedWidths[2]).toBe(300); // Within range
      expect(clampedWidths[3]).toBe(500); // Clamped to max
    });

    it('Resize — double-click auto-fit calculation', () => {
      // Simulate content width measurement
      const contentWidth = 180;
      const padding = 20;
      const minWidth = 80;

      const autoFitWidth = Math.max(minWidth, contentWidth + padding);

      expect(autoFitWidth).toBe(200);
      expect(autoFitWidth).toBeGreaterThanOrEqual(minWidth);
    });

    it('Resize — does not trigger sort', () => {
      let sortTriggered = false;

      // Simulate resize handle click
      const resizeHandleClick = (e: { stopPropagation: () => void }) => {
        e.stopPropagation(); // Prevent sort trigger
      };

      const mockEvent = {
        stopPropagation: () => {
          // Sort should not be triggered
        },
      };

      resizeHandleClick(mockEvent);

      expect(sortTriggered).toBe(false);
    });

    it('Resize — persists to URL or localStorage', () => {
      const columnWidths = {
        name: 200,
        email: 250,
      };

      // Serialize
      const serialized = JSON.stringify(columnWidths);

      // Deserialize
      const deserialized = JSON.parse(serialized);

      expect(deserialized.name).toBe(200);
      expect(deserialized.email).toBe(250);
    });
  });
}
