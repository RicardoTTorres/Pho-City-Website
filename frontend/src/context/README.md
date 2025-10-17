# /src/context

This folder contains React Context Providers and Hooks for global state management.

- `ContentContext.tsx`: Provides site-wide text and configuration data to sections and components.

All contexts should:

- Use TypeScript interfaces for context values.
- Export both the provider (`<ContentProvider>`) and a custom hook (e.g., `useContent()`).
