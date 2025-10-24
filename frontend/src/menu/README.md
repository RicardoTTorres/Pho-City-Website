# Menu Formatter Script

This script (`formatMenu.ts`) reads a plain text menu file and automatically converts it into a **TypeScript-friendly JSON format**.

---

## Features

Automatically detects **menu sections**  
Supports **items with or without descriptions**  
Outputs a fully typed **TypeScript file (`menu.ts`)**  
Preserves readable indentation and formatting  
Simple **CLI usage** — specify input and output files

---

## Instructions

1. install ts.node
   npm install -g ts-node typescript
2. to run
   npx ts-node formatMenu.ts menu.txt menu.ts
