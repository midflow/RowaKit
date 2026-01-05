/**
 * Demo 06: Saved Views
 * Metadata and documentation
 */

export const meta = {
  title: 'Saved Views',
  description: 'Persist table configurations to localStorage for quick access.',
  keywords: ['saved-views', 'persistence', 'localStorage', 'workflow'],
  difficulty: 'intermediate',
  learningOutcomes: [
    'Save table state to localStorage',
    'Load and restore views',
    'Manage multiple saved configurations',
    'Handle JSON serialization safely',
  ],
  notes: `
## Saving Views

Store table state in localStorage:

\`\`\`typescript
interface SavedView {
  id: string;
  name: string;
  state: TableState;
  createdAt: Date;
}

const saveView = () => {
  const newView: SavedView = {
    id: Date.now().toString(),
    name: viewName,
    state,
    createdAt: new Date(),
  };
  const updated = [...views, newView];
  localStorage.setItem('my-views', JSON.stringify(updated));
  setViews(updated);
};
\`\`\`

## Loading Views

Load on component mount:

\`\`\`typescript
useEffect(() => {
  const saved = localStorage.getItem('my-views');
  if (saved) {
    try {
      setViews(JSON.parse(saved));
    } catch (err) {
      console.error('Failed to load views');
    }
  }
}, []);
\`\`\`

## Applying Views

Restore a saved configuration:

\`\`\`typescript
const applyView = (view: SavedView) => {
  setState(view.state);
};
\`\`\`

## Best Practices

- Validate localStorage data with try/catch
- Add timestamps to saved views
- Limit number of saved views (e.g., 10 max)
- Allow users to rename/delete views
- Show when view was last saved

## Next Steps

Learn about column resizing in the next demo.
  `,
};
