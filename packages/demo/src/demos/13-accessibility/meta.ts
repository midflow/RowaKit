/**
 * Demo 13: Accessibility Baseline
 * Metadata and documentation
 */

export const meta = {
  title: 'Accessibility Baseline',
  description: 'Keyboard navigation and semantic HTML for screen readers (Stage E).',
  keywords: ['a11y', 'accessibility', 'wcag', 'keyboard', 'screen-reader', 'stage-e'],
  difficulty: 'advanced',
  learningOutcomes: [
    'Understand aria-sort attributes on headers',
    'Navigate with Tab and Shift+Tab in modals',
    'Use ESC to close dialogs',
    'Keyboard access to all features',
    'Screen reader friendly semantic HTML',
  ],
  notes: `
## Key Features

### Sorting Headers
- \`aria-sort="ascending"\` on actively sorted columns
- Keyboard: Tab to header, Enter or Space to sort
- Multi-sort: Shift+Space for secondary sort

### Modal Focus Management
- Focus trap: Tab stays within modal
- Auto-focus: First button receives focus
- ESC key closes modal
- Focus returns to trigger button after close

### Keyboard Shortcuts
- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter / Space**: Activate buttons, sort headers
- **ESC**: Close modals/dialogs

### Semantic HTML
- \`role="dialog"\` on confirmation modals
- \`aria-modal="true"\` to indicate modal context
- \`aria-labelledby\` links dialog title
- \`<table>\`, \`<thead>\`, \`<tbody>\` proper structure

## Testing

Use these tools to verify:
- Screen reader: NVDA (Windows), JAWS, VoiceOver (Mac)
- Keyboard only: Navigate entire table without mouse
- DevTools: Check Accessibility panel for issues

## WCAG 2.1 Compliance

- **Level A**: Basic keyboard navigation (✅ included)
- **Level AA**: Screen reader support (✅ included)
- **Level AAA**: Enhanced color contrast (custom responsibility)
  `,
};
