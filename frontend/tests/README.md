# Frontend Tests

Framework: **Vitest** + **React Testing Library**

## Installation

```bash
cd frontend
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add to `frontend/vite.config.ts`:

```ts
/// <reference types="vitest" />
export default defineConfig({
  // ...existing config
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

Create `frontend/tests/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Add to `frontend/package.json` scripts:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

> Vitest is already aware of the Vite config (aliases, env vars, plugins), so TypeScript paths and `import.meta.env` work out of the box.

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Interactive browser UI
npm run test:ui

# Run only unit tests
npx vitest run tests/unit

# Run only component tests
npx vitest run tests/components

# Run a single file
npx vitest run tests/unit/utils/menuHelper.test.ts

# With coverage
npm run test:coverage
```

## Mocking Strategy

- **`fetch`** — use `vi.stubGlobal('fetch', vi.fn())` or `msw` for API client tests
- **`localStorage`** — use `vi.stubGlobal` or the jsdom built-in
- **React Router** — wrap components in `<MemoryRouter>` for components that use `useNavigate` / `<Link>`
- **ContentContext** — create a test wrapper that provides mock context values

---

## Test Files

### `unit/utils/`

| File | Description |
|---|---|
| `menuHelper.test.ts` | `parseBilingualName` — bracket parsing, no-bracket fallback, empty string edge case |
| `utils.test.ts` | `cn()` class merge utility — conflict resolution, conditional classes, empty input |

### `unit/api/`

| File | Description |
|---|---|
| `menu.test.ts` | All 10 functions — correct method, URL, headers, `credentials: "include"` on write operations |
| `navbar.test.ts` | `getNavbar` and `putNavbar` — URL and credentials |
| `hero.test.ts` | `getHero` request deduplication (parallel calls → single fetch), `updateHero` payload |
| `footer.test.ts` | `getFooter` request deduplication, `updateFooter` payload |
| `traffic.test.ts` | `postTraffic` sends UUID from localStorage, creates UUID if absent; `getTraffic` shape |
| `upload.test.ts` | `uploadImage` sends multipart body; `listMedia` appends `?section=` param; `deleteMedia` |
| `activity.test.ts` | `fetchRecentActivity` — correct URL and credentials |
| `settings.test.ts` | All 5 functions — URLs, credentials, request bodies |

### `unit/context/`

| File | Description |
|---|---|
| `ContentContext.test.tsx` | Initial fetch on mount, localStorage persistence, invalid cache reset, `updateContent` merge, `resetContent`, `refreshMenuPublic`, `refreshMenuAdmin`, `useContent` throws outside provider |

### `components/public/`

| File | Description |
|---|---|
| `ContactForm.test.tsx` | Renders fields, shows validation errors on empty submit, shows success state after API resolves, shows error state on API failure |
| `Navbar.test.tsx` | Renders links from context, mobile menu toggle open/close |
| `Hero.test.tsx` | Renders title, subtitle, and both CTA buttons from context values |
| `MenuSidebar.test.tsx` | Renders category list, click triggers correct scroll/filter callback |
| `MenuPreview.test.tsx` | Renders featured items, displays bilingual names correctly |
| `Footer.test.tsx` | Renders social links, nav links, and brand text from context |

### `components/cms/`

| File | Description |
|---|---|
| `AdminLogin.test.tsx` | Shows error message on failed login, redirects to dashboard on success, disables submit during loading |
| `CMSLayout.test.tsx` | Renders sidebar nav and content slot, redirects unauthenticated user to login |
| `HeroSectionEditor.test.tsx` | Field edits call `updateContent`, save button calls `updateHero`, shows save feedback |
| `NavbarSectionEditor.test.tsx` | Renders links list, add/remove link updates state, save calls `putNavbar` |
| `FooterSectionEditor.test.tsx` | Field edits and save call correct API, social link add/remove |
| `ContactSectionEditor.test.tsx` | Renders hours per day, "closed" toggle disables time fields, save calls correct endpoint |
| `MenuSectionEditor.test.tsx` | Add category, add item to category, edit item name, toggle visibility, delete item |
| `MediaPage.test.tsx` | Lists media items, upload button triggers file input, delete shows confirmation before removing |
| `SettingsPage.test.tsx` | Renders inbox submissions, mark-as-read updates indicator, settings form saves on submit |
| `DashboardPage.test.tsx` | Renders stats counts from context, renders recent activity list |
