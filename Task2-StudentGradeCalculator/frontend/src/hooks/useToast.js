import { useState, useCallback } from 'react';

let toastIdCounter = 0;

/**
 * useToast — lightweight toast queue manager.
 *
 * Returns:
 *   toasts      — current list of active toasts (pass to <Toast>)
 *   showToast   — (message, type?, duration?) → shows a toast
 *   dismissToast — (id) → removes a specific toast
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = `toast-${++toastIdCounter}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
}
