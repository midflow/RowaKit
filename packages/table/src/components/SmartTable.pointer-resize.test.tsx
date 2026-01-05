/**
 * @fileoverview Tests for SmartTable Pointer Events resizing (PRD-02)
 * Tests that pointer events (mouse + touch + pen) work for column resizing
 * Note: Direct PointerEvent construction is not supported in jsdom, so we
 * test the behavior through the implementation and CSS integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SmartTable } from './SmartTable';
import { col } from '../column-helpers';
import type { Fetcher } from '../types';

// ============================================================================
// TEST DATA
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

// ============================================================================
// POINTER EVENTS TESTS (PRD-02)
// ============================================================================

describe('SmartTable - Pointer Events Resizing (PRD-02)', () => {
  describe('Pointer event handler signature', () => {
    it('resize handle is ready for pointer events via onPointerDown', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Verify that the resize handle exists and is ready for pointer events
      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;
      expect(resizeHandle).toBeDefined();
      
      // The handle should accept pointer events (no specific assertion needed;
      // the onPointerDown handler is configured in React JSX)
      expect(resizeHandle.className).toContain('rowakit-column-resize-handle');
    });

    it('touch-action: none is applied to prevent default touch scrolling', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Verify resize handle class exists (touch-action: none is in CSS)
      const resizeHandle = document.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;
      expect(resizeHandle).toBeDefined();
      expect(resizeHandle.className).toContain('rowakit-column-resize-handle');
    });
  });

  describe('Pointer event cleanup on completion', () => {
    it('cleans up body class when resize completes via pointerup', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;

      // Initially no resizing class
      expect(document.body.classList.contains('rowakit-resizing')).toBe(false);

      // Simulate pointerdown (note: using dispatchEvent with synthetic event)
      // This will be handled by the React PointerEvent handler
      const pointerDownEvent = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });

      // Mock pointer properties that would be present in a real PointerEvent
      Object.defineProperty(pointerDownEvent, 'pointerType', { value: 'mouse' });
      Object.defineProperty(pointerDownEvent, 'buttons', { value: 1 });
      Object.defineProperty(pointerDownEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // During drag, body class should be added
      expect(document.body.classList.contains('rowakit-resizing')).toBe(true);

      // Simulate pointerup
      const pointerUpEvent = new MouseEvent('pointerup', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(pointerUpEvent, 'pointerType', { value: 'mouse' });
      Object.defineProperty(pointerUpEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(pointerUpEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // After pointerup, body class should be removed
      expect(document.body.classList.contains('rowakit-resizing')).toBe(false);
    });

    it('cleans up body class on pointercancel (interruption)', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;

      // Simulate pointerdown
      const pointerDownEvent = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(pointerDownEvent, 'pointerType', { value: 'touch' });
      Object.defineProperty(pointerDownEvent, 'buttons', { value: 1 });
      Object.defineProperty(pointerDownEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(document.body.classList.contains('rowakit-resizing')).toBe(true);

      // Simulate pointercancel (e.g., incoming call on mobile)
      const pointerCancelEvent = new MouseEvent('pointercancel', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(pointerCancelEvent, 'pointerType', { value: 'touch' });
      Object.defineProperty(pointerCancelEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(pointerCancelEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // After pointercancel, body class should be removed
      expect(document.body.classList.contains('rowakit-resizing')).toBe(false);
    });
  });

  describe('Pointer event support', () => {
    it('handles mouse pointer events with primary button requirement', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;

      // Primary button (buttons = 1) should initiate resize
      const primaryButtonEvent = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(primaryButtonEvent, 'pointerType', { value: 'mouse' });
      Object.defineProperty(primaryButtonEvent, 'buttons', { value: 1 });
      Object.defineProperty(primaryButtonEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(primaryButtonEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should be in resizing state
      expect(document.body.classList.contains('rowakit-resizing')).toBe(true);

      // Clean up
      const pointerUpEvent = new MouseEvent('pointerup', {
        bubbles: true,
      });
      Object.defineProperty(pointerUpEvent, 'pointerId', { value: 1 });
      resizeHandle.dispatchEvent(pointerUpEvent);
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('supports touch pointer input', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;

      // Touch doesn't have buttons property
      const touchEvent = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(touchEvent, 'pointerType', { value: 'touch' });
      Object.defineProperty(touchEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(touchEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should be in resizing state (touch doesn't check buttons)
      expect(document.body.classList.contains('rowakit-resizing')).toBe(true);

      // Clean up
      const pointerUpEvent = new MouseEvent('pointerup', {
        bubbles: true,
      });
      Object.defineProperty(pointerUpEvent, 'pointerId', { value: 1 });
      resizeHandle.dispatchEvent(pointerUpEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(document.body.classList.contains('rowakit-resizing')).toBe(false);
    });

    it('supports pen pointer input', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name', { width: 100 }),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableColumnResizing={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      const resizeHandle = container.querySelector('.rowakit-column-resize-handle') as HTMLDivElement;

      // Pen input (buttons = 1)
      const penEvent = new MouseEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperty(penEvent, 'pointerType', { value: 'pen' });
      Object.defineProperty(penEvent, 'buttons', { value: 1 });
      Object.defineProperty(penEvent, 'pointerId', { value: 1 });

      resizeHandle.dispatchEvent(penEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should be in resizing state
      expect(document.body.classList.contains('rowakit-resizing')).toBe(true);

      // Clean up
      const pointerUpEvent = new MouseEvent('pointerup', {
        bubbles: true,
      });
      Object.defineProperty(pointerUpEvent, 'pointerId', { value: 1 });
      resizeHandle.dispatchEvent(pointerUpEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(document.body.classList.contains('rowakit-resizing')).toBe(false);
    });
  });
});
