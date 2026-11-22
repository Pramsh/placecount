const isSensitiveKey = (key: string): boolean => {
  return /password|passwd|secret|token|authorization|cookie|api[-_]?key/i.test(
    key,
  );
};

const serializeError = (input: Error, seen: WeakSet<object>): unknown => {
  if (seen.has(input)) {
    return "[Circular Error]";
  }

  seen.add(input);

  try {
    const result = Object.create(null);

    result.name = input.name;
    result.message = input.message;

    try {
      if (typeof input.stack === "string") {
        result.stack = input.stack;
      }
    } catch {
      result.stack = "[Unserializable Stack]";
    }

    for (const key of Object.keys(input)) {
      if (key === "cause") continue;

      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
        continue;
      }

      try {
        result[key] = serialize(
          (input as unknown as Record<string, unknown>)[key],
          seen,
        );
      } catch {
        result[key] = "[Unserializable Property]";
      }
    }

    try {
      if ("cause" in input) {
        result.cause = serialize(
          (input as Error & { cause?: unknown }).cause,
          seen,
        );
      }
    } catch {
      result.cause = "[Unserializable Cause]";
    }

    return result;
  } finally {
    seen.delete(input);
  }
};

export const serialize = (
  value: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown => {
  if (value instanceof Error) {
    return serializeError(value, seen);
  }

  if (value === undefined) {
    return "[Undefined]";
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[Circular Reference]";
  }

  // Date
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString();
  }

  // RegExp
  if (value instanceof RegExp) {
    return value.toString();
  }

  // URL
  if (value instanceof URL) {
    return value.toString();
  }

  seen.add(value);

  try {
    // Array
    if (Array.isArray(value)) {
      return Array.from(value, (item) => serialize(item, seen));
    }

    // Map
    if (value instanceof Map) {
      return {
        type: "Map",
        entries: Array.from(value.entries(), ([key, item]) => [
          serialize(key, seen),
          serialize(item, seen),
        ]),
      };
    }

    // Set
    if (value instanceof Set) {
      return {
        type: "Set",
        values: Array.from(value, (item) => serialize(item, seen)),
      };
    }

    // Oggetto generico
    const result: Record<string, unknown> = Object.create(null);

    for (const key of Object.keys(value)) {
      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
        continue;
      }

      try {
        result[key] = serialize((value as Record<string, unknown>)[key], seen);
      } catch {
        result[key] = "[Unserializable Property]";
      }
    }

    return result;
  } finally {
    seen.delete(value);
  }
};
