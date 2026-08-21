"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastContext = createContext(undefined);
const toneStyles = {
  success: "border-success/20 bg-success-soft text-success",
  error: "border-danger/20 bg-danger-soft text-danger",
  info: "border-info/20 bg-info-soft text-info"
};
const toneIcons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />
};
let idCounter = 0;
export function ToastProvider({
  children
}) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback(id => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);
  const toast = useCallback(message => {
    idCounter += 1;
    const id = `toast_${idCounter}`;
    setToasts(current => [...current, {
      ...message,
      id
    }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);
  const value = useMemo(() => ({
    toast
  }), [toast]);
  return <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map(t => <div key={t.id} role="alert" className={cn("animate-slide-in-right pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface p-3.5 shadow-lg", toneStyles[t.tone])}>
            {toneIcons[t.tone]}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
            </div>
            <button onClick={() => remove(t.id)} title="Dismiss notification" aria-label="Dismiss notification" className="focus-ring rounded p-0.5 text-muted-foreground hover:bg-black/5">
              <X className="h-4 w-4" />
            </button>
          </div>)}
      </div>
    </ToastContext.Provider>;
}
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
