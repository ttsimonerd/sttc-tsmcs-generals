import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from './Primitives';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export const useToast = (): ToastApi => useContext(ToastContext);

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  info: 'border-[color:var(--line-strong)] bg-white/[0.06] text-zinc-100',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[200] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 md:bottom-5 md:right-5">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'animate-fade-in-up rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl',
              TONE_STYLES[item.tone]
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
