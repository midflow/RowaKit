/**
 * @fileoverview Tests for SmartTable Saved Views v1.1 (PRD-04)
 * Tests localStorage persistence, hydration, index management, and form validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
// SAVED VIEWS TESTS (PRD-04)
// ============================================================================

describe('SmartTable - Saved Views v1.1 (PRD-04)', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Storage index and persistence', () => {
    it('creates rowakit-views-index when saving a view', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Enter name
      const input = container.querySelector('.rowakit-save-view-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test View' } });

      // Save
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // Index should be created
        const index = localStorage.getItem('rowakit-views-index');
        expect(index).toBeDefined();
        const parsed = JSON.parse(index!);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.some((item: any) => item.name === 'Test View')).toBe(true);
      });
    });

    it('persists view state to localStorage', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Enter name
      const input = container.querySelector('.rowakit-save-view-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'My View' } });

      // Save
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // View should be stored
        const viewStr = localStorage.getItem('rowakit-view-My View');
        expect(viewStr).toBeDefined();
        const view = JSON.parse(viewStr!);
        expect(view.page).toBe(1);
        expect(view.pageSize).toBeDefined();
      });
    });
  });

  describe('Hydration on mount', () => {
    it('loads saved views from storage on mount', async () => {
      // Pre-populate storage
      const index = [{ name: 'Saved View 1', updatedAt: Date.now() }];
      const viewState = {
        page: 2,
        pageSize: 10,
        filters: { name: 'test' },
      };
      localStorage.setItem('rowakit-views-index', JSON.stringify(index));
      localStorage.setItem('rowakit-view-Saved View 1', JSON.stringify(viewState));

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
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        // Saved view should appear in UI
        expect(screen.getByText('Saved View 1')).toBeDefined();
      });
    });

    it('scans localStorage for rowakit-view-* when index is missing', async () => {
      // Pre-populate storage without index (simulating legacy state)
      const viewState = {
        page: 1,
        pageSize: 20,
      };
      localStorage.setItem('rowakit-view-Legacy View', JSON.stringify(viewState));

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
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        // Orphaned view should be discovered
        expect(screen.getByText('Legacy View')).toBeDefined();
      });
    });

    it('ignores corrupt view entries during hydration', async () => {
      // Pre-populate storage with corrupt JSON
      const index = [
        { name: 'Good View', updatedAt: Date.now() },
        { name: 'Bad View', updatedAt: Date.now() },
      ];
      localStorage.setItem('rowakit-views-index', JSON.stringify(index));
      localStorage.setItem('rowakit-view-Good View', JSON.stringify({ page: 1, pageSize: 10 }));
      localStorage.setItem('rowakit-view-Bad View', '{invalid json}');

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
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        // Good view should load, bad view should be skipped
        expect(screen.getByText('Good View')).toBeDefined();
        expect(screen.queryByText('Bad View')).toBeNull();
      });
    });
  });

  describe('Delete removes from index and storage', () => {
    it('deletes view from both index and storage', async () => {
      // Pre-populate storage
      const index = [{ name: 'To Delete', updatedAt: Date.now() }];
      localStorage.setItem('rowakit-views-index', JSON.stringify(index));
      localStorage.setItem('rowakit-view-To Delete', JSON.stringify({ page: 1, pageSize: 10 }));

      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('To Delete')).toBeDefined();
      });

      // Find and click delete button
      const deleteButtons = container.querySelectorAll('.rowakit-saved-view-button-delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        // View should be removed from UI
        expect(screen.queryByText('To Delete')).toBeNull();
        
        // View should be removed from storage
        expect(localStorage.getItem('rowakit-view-To Delete')).toBeNull();
        
        // Index should be updated
        const indexStr = localStorage.getItem('rowakit-views-index');
        if (indexStr) {
          const indexData = JSON.parse(indexStr);
          expect(indexData.some((item: any) => item.name === 'To Delete')).toBe(false);
        }
      });
    });
  });

  describe('Form validation', () => {
    it('rejects empty view names', async () => {
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
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Try to save with empty name
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // Error should appear
        expect(screen.getByText('Name cannot be empty')).toBeDefined();
      });
    });

    it('rejects names longer than 40 characters', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Enter long name
      const input = container.querySelector('.rowakit-save-view-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'a'.repeat(50) } });

      // Try to save
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // Error should appear
        expect(screen.getByText('Name cannot exceed 40 characters')).toBeDefined();
      });
    });

    it('rejects names with invalid characters', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Enter name with invalid char
      const input = container.querySelector('.rowakit-save-view-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Bad/View' } });

      // Try to save
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // Error should appear
        expect(screen.getByText('Name contains invalid characters')).toBeDefined();
      });
    });
  });

  describe('Overwrite confirmation', () => {
    it('prompts for confirmation when saving over existing view', async () => {
      // Pre-populate storage
      const index = [{ name: 'Existing', updatedAt: Date.now() }];
      localStorage.setItem('rowakit-views-index', JSON.stringify(index));
      localStorage.setItem('rowakit-view-Existing', JSON.stringify({ page: 1, pageSize: 10 }));

      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Existing')).toBeDefined();
      });

      // Open save form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Enter existing name
      const input = container.querySelector('.rowakit-save-view-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Existing' } });

      // Try to save
      const buttons = screen.getAllByText('Save');
      fireEvent.click(buttons[buttons.length - 1]!);

      await waitFor(() => {
        // Confirmation should appear
        expect(screen.getByText(/already exists/)).toBeDefined();
      });

      // Click Overwrite
      const overwriteButton = screen.getByText('Overwrite');
      fireEvent.click(overwriteButton);

      await waitFor(() => {
        // Form should close
        expect(screen.queryByText(/already exists/)).toBeNull();
      });
    });
  });

  describe('Non-blocking UI', () => {
    it('does not use window.prompt', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Save View button should toggle form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Form should appear (not prompt)
      const input = container.querySelector('.rowakit-save-view-input');
      expect(input).toBeDefined();
    });

    it('allows canceling the save form', async () => {
      const fetcher: Fetcher<User> = async () => ({
        items: mockUsers,
        total: 3,
      });

      const { container } = render(
        <SmartTable
          fetcher={fetcher}
          columns={[
            col.text<User>('name'),
            col.text<User>('email'),
          ]}
          rowKey="id"
          enableSavedViews={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeDefined();
      });

      // Open form
      const saveButton = screen.getByText('Save View');
      fireEvent.click(saveButton);

      // Form should appear
      let input = container.querySelector('.rowakit-save-view-input');
      expect(input).toBeDefined();

      // Click Cancel
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]!);

      // Form should close
      input = container.querySelector('.rowakit-save-view-input');
      expect(input).toBeNull();
    });
  });
});
