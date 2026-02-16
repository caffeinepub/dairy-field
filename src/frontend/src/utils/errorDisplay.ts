/**
 * Sanitizes and normalizes errors into safe English display text
 * Handles Error objects, strings, and various edge cases
 * Redacts potential secrets and removes noisy prefixes
 */
export function sanitizeError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  let message = '';

  // Handle Error objects
  if (error instanceof Error) {
    message = error.message;
  }
  // Handle string errors
  else if (typeof error === 'string') {
    message = error;
  }
  // Handle objects with message property
  else if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') {
      message = msg;
    }
  }
  // Fallback for other types
  else {
    try {
      const stringified = String(error);
      if (stringified && stringified !== '[object Object]') {
        message = stringified;
      }
    } catch {
      // Ignore stringify errors
    }
  }

  // If we still don't have a message, return default
  if (!message) {
    return 'An unexpected error occurred';
  }

  // Strip common noisy prefixes
  message = message.replace(/^Error:\s*/i, '');
  message = message.replace(/^Uncaught\s*/i, '');
  message = message.replace(/^TypeError:\s*/i, '');
  message = message.replace(/^ReferenceError:\s*/i, '');
  message = message.replace(/^RangeError:\s*/i, '');
  message = message.replace(/^SyntaxError:\s*/i, '');
  message = message.replace(/^Call failed:\s*/i, '');
  message = message.replace(/^Request failed:\s*/i, '');

  // Redact potential secrets (tokens, keys, etc.)
  // Look for patterns like "token=...", "key=...", "secret=..." and redact the value
  message = message.replace(
    /\b(token|key|secret|password|auth|credential|api[_-]?key)\s*[=:]\s*[^\s&]+/gi,
    '$1=[REDACTED]'
  );

  // Redact long hex strings that might be tokens
  message = message.replace(/\b[a-f0-9]{32,}\b/gi, '[REDACTED_TOKEN]');

  // Trim and ensure we have something
  message = message.trim();
  
  return message || 'An error occurred';
}

/**
 * Formats an error for display with a friendly prefix
 */
export function formatErrorForDisplay(error: unknown, prefix?: string): string {
  const sanitized = sanitizeError(error);
  return prefix ? `${prefix}: ${sanitized}` : sanitized;
}
