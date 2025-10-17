# /src/config

This folder stores reusable configuration files that define application settings and structural data.

## Common Files

- `footer.config.ts` — Defines footer navigation links, social links, and contact info.
- `navbar.config.ts` — Defines the structure of the site navigation

## Guidelines

- Config files should **export plain objects or arrays**, not React components.
- Avoid hardcoding sensitive information (e.g., API keys) — use environment variables instead.
