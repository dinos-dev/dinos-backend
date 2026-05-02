export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value));
}

export function getErrorMessage(value: unknown): string {
  return toError(value).message;
}

export function getErrorStack(value: unknown): string | undefined {
  return toError(value).stack;
}
