// src/shared/components/ui/Portal.tsx
// Renders children directly on document.body via a React portal.

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
