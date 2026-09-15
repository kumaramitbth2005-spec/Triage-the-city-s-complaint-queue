import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * Toast component for transient feedback messages.
 *
 * @param {object} props
 * @param {string} props.message - Text to display.
 * @param {string} [props.type='default'] - 'default', 'success', 'error', 'info'.
 * @param {boolean} [props.show] - Controls visibility.
 * @param {function} [props.onClose] - Callback when toast hides.
 * @param {string} [props.className] - Additional Tailwind classes.
 */
export function Toast({ message, type = 'default', show = false, onClose, className }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const typeStyles = {
    default: 'bg-gray-800 text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-sky-600 text-white',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 max-w-sm w-full rounded-lg shadow-lg p-4 z-50 transition-opacity duration-300',
        typeStyles[type] ?? typeStyles.default,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
}
