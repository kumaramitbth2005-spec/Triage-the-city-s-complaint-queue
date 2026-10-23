/**
 * Robust Clipboard Copy Helper
 * Uses modern navigator.clipboard with fallback to document.execCommand
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // 1. Try native Clipboard API
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Navigator clipboard write failed, falling back to execCommand:', err);
    }
  }

  // 2. Fallback for insecure contexts, older browsers, or mobile webviews
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Boolean(successful);
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
    return false;
  }
}
