import { useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useToast() {
  const { addToast, removeToast, toasts } = useUIStore();

  const success = useCallback(
    (message: string, duration?: number) => addToast({ type: 'success', message, duration }),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast({ type: 'error', message, duration }),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast({ type: 'info', message, duration }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast({ type: 'warning', message, duration }),
    [addToast]
  );

  return {
    toasts,
    success,
    error,
    info,
    warning,
    dismiss: removeToast,
  };
}
