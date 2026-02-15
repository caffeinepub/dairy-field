/**
 * Sanitizes and normalizes errors into safe English display text
 * Handles Error objects, strings, and unknown types
 */
export function sanitizeError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    let message = error.message;
    
    // Strip common noisy prefixes
    message = message.replace(/^Error:\s*/i, '');
    message = message.replace(/^Uncaught\s*/i, '');
    message = message.replace(/^TypeError:\s*/i, '');
    message = message.replace(/^ReferenceError:\s*/i, '');
    
    // Trim and return
    return message.trim() || 'An error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error.trim() || 'An error occurred';
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      return msg.trim() || 'An error occurred';
    }
  }

  // Fallback for other types
  try {
    const stringified = String(error);
    if (stringified && stringified !== '[object Object]') {
      return stringified;
    }
  } catch {
    // Ignore stringify errors
  }

  return 'An unexpected error occurred';
}

/**
 * Formats an error for display with a friendly prefix
 */
export function formatErrorForDisplay(error: unknown, prefix?: string): string {
  const sanitized = sanitizeError(error);
  return prefix ? `${prefix}: ${sanitized}` : sanitized;
}
