// src/shared/components/ui/Toast.tsx
import { useCallback, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Portal } from "./Portal";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const DISMISS_MS = 4000;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DISMISS_MS);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

const TYPE_STYLES: Record<ToastType, { bar: string; icon: string; IconComponent: React.ElementType }> = {
  success: {
    bar: "bg-green-500",
    icon: "text-green-500",
    IconComponent: CheckCircle,
  },
  error: {
    bar: "bg-red-500",
    icon: "text-red-500",
    IconComponent: AlertCircle,
  },
  info: {
    bar: "bg-gray-400",
    icon: "text-gray-400",
    IconComponent: Info,
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { bar, icon, IconComponent } = TYPE_STYLES[toast.type];

  return (
    <div className="pointer-events-auto flex items-stretch bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      {/* Colored left accent bar */}
      <div className={`w-1 shrink-0 ${bar}`} />

      {/* Content */}
      <div className="flex items-start gap-2.5 px-3 py-3 flex-1 min-w-0">
        <IconComponent className={`w-4 h-4 mt-0.5 shrink-0 ${icon}`} />
        <p className="text-sm text-gray-800 leading-snug flex-1">{toast.message}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="px-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0 self-start pt-2.5"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <Portal>
      {/* Full-width on mobile, fixed 320px at bottom-right on sm+ */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </Portal>
  );
}
