interface ErrorDetail {
  message?: unknown;
  cause?: unknown;
  errors?: unknown;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  const object = asObject(error);
  if (typeof object?.message === 'string') return object.message;
  return String(error);
}

function causeOf(error: unknown): unknown {
  if (error instanceof Error) return error.cause;
  return (asObject(error) as ErrorDetail | null)?.cause;
}

function nestedErrorsOf(error: unknown): unknown[] {
  if (error instanceof AggregateError) return [...error.errors];
  const errors = (asObject(error) as ErrorDetail | null)?.errors;
  return Array.isArray(errors) ? errors : [];
}

function formatCause(error: unknown, seen = new Set<unknown>()): string | null {
  if (!error || seen.has(error)) return null;
  seen.add(error);

  const nestedErrors = nestedErrorsOf(error);
  if (nestedErrors.length > 0) {
    const details = nestedErrors
      .map((entry) => formatCause(entry, seen) ?? messageOf(entry))
      .filter((entry) => entry.trim() !== '');
    if (details.length > 0) return details.join('; ');
  }

  const message = messageOf(error);
  const nestedCause = causeOf(error);
  const nested = nestedCause ? formatCause(nestedCause, seen) : null;
  if (nested && nested !== message) return message ? `${message}: ${nested}` : nested;
  return message || null;
}

export function formatMcpError(error: unknown): string {
  const message = messageOf(error);
  const cause = causeOf(error);
  const detail = cause ? formatCause(cause) : null;
  if (!detail || detail === message) return message;
  return `${message} (${detail})`;
}
