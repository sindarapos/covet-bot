function isRecord(element: unknown): element is Record<string, unknown> {
  return !!element && Object.getPrototypeOf(element) === Object.prototype;
}

export function isRecordWithProperties<K extends PropertyKey[]>(
  element: unknown,
  prop: K,
): element is Record<K[number], unknown> {
  if (!isRecord(element)) {
    return false;
  }
  return prop.every((value) => value in element);
}
