/**
 * useFocusTrap: A hook to trap focus within a modal/dialog element
 * 
 * Ensures keyboard navigation (Tab/Shift+Tab) stays within the modal,
 * and ESC key can close it.
 */

import { useEffect, useRef } from 'react';

export interface UseFocusTrapOptions {
  /** Called when ESC is pressed */
  onEscape?: () => void;
  /** Whether to automatically focus first focusable element on mount */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTORS = [
  'button',
  '[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Trap focus within a modal element.
 * - Pressing Tab cycles through focusable elements within the modal
 * - Pressing Shift+Tab cycles backwards
 * - Pressing ESC triggers the onEscape callback
 * - First focusable element is focused by default on mount
 */
export function useFocusTrap(ref: React.RefObject<HTMLDivElement>, options: UseFocusTrapOptions = {}) {
  const { onEscape, autoFocus = true } = options;
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const modalEl = ref.current;
    if (!modalEl) return;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      const elements = Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTORS)) as HTMLElement[];
      return elements.filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    };

    let focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;

    // Auto-focus first element
    if (autoFocus && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const activeEl = document.activeElement as HTMLElement;
      const firstEl = focusableElements[0] || null;
      const lastEl = focusableElements[focusableElements.length - 1] || null;

      // ESC key
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape?.();
        return;
      }

      // TAB key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab: go to previous element
          if (activeEl === firstEl && lastEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab: go to next element
          if (activeEl === lastEl && firstEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    modalEl.addEventListener('keydown', handleKeyDown);
    return () => {
      modalEl.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onEscape, autoFocus]);
}
