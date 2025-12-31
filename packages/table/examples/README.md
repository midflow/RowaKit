# @rowakit/table Examples

This directory contains practical examples demonstrating various features and use cases of the SmartTable component.

## Examples

### 1. Basic Usage ([basic-usage.tsx](./basic-usage.tsx))
**What you'll learn:**
- Setting up a fetcher function for server-side data
- Defining columns with different types
- Handling pagination and sorting
- Implementing row actions with confirmation
- Error and loading states

**Best for:** Getting started, understanding the core concepts

### 2. Mock Server ([mock-server.tsx](./mock-server.tsx))
**What you'll learn:**
- Creating a mock server-side fetcher for testing
- Simulating network delays and server-side sorting
- Working without a real backend API
- Testing table behavior locally

**Best for:** Development and testing without a backend

### 3. Custom Columns ([custom-columns.tsx](./custom-columns.tsx))
**What you'll learn:**
- Using `col.custom()` for complex rendering
- Combining multiple fields in a single column
- Creating computed columns (e.g., tenure calculation)
- Adding custom styling and components
- Rendering avatars, badges, and formatted values

**Best for:** Advanced column rendering, custom UI components

### 4. Styling ([styling.tsx](./styling.tsx))
**What you'll learn:**
- Using the `className` prop for custom styling
- Customizing appearance via CSS variables
- Creating custom themes
- Styling status badges and priority indicators
- Responsive design patterns

**Best for:** Theming, branding, custom visual design

## Running the Examples

### Option 1: Copy Into Your Project

Copy any example file into your React project and adjust the imports:

```tsx
import { SmartTable, col } from '@rowakit/table';
import '@rowakit/table/styles';
```

### Option 2: Integrate With Your API

Replace the mock fetcher with your actual API:

```tsx
const fetchUsers: Fetcher<User> = async (query) => {
  const response = await fetch(`/api/users?${buildQueryString(query)}`);
  return response.json();
};
```

### Option 3: Use as Reference

Browse the examples to understand patterns and best practices, then adapt them to your specific needs.

## Common Patterns

### Building Query Strings

```tsx
const fetchData: Fetcher<T> = async (query) => {
  const params = new URLSearchParams({
    page: query.page.toString(),
    pageSize: query.pageSize.toString(),
  });

  if (query.sort) {
    params.append('sortBy', query.sort.field);
    params.append('sortOrder', query.sort.direction);
  }

  const response = await fetch(`/api/data?${params}`);
  return response.json();
};
```

### Error Handling

```tsx
const fetchData: Fetcher<T> = async (query) => {
  try {
    const response = await fetch(`/api/data?${buildQuery(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    // Error will be displayed in table with retry button
    throw error;
  }
};
```

### Conditional Actions

```tsx
col.actions<User>([
  {
    id: 'delete',
    label: 'Delete',
    confirm: true,
    // Disable delete for admin users
    disabled: (user) => user.role === 'admin',
    onClick: async (user) => {
      await deleteUser(user.id);
    },
  },
])
```

### Custom Formatting

```tsx
col.text<Product>('price', {
  header: 'Price',
  format: (price) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price),
})
```

## Need More Help?

- Check the main [README](../README.md) for full API documentation
- Browse the [tests](../src/components/) for edge cases and advanced usage
- Open an issue on GitHub for questions or feature requests

## Contributing Examples

Have a useful example? Contributions are welcome! Please:
1. Follow the existing example format
2. Include clear comments explaining what's demonstrated
3. Add the example to this README
4. Ensure code is properly formatted and tested
