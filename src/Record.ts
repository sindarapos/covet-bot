export function isRecord(element: unknown): element is Record<string, unknown> {
  return !!element && Object.getPrototypeOf(element) === Object.prototype;
}

export function isRecordWithProperties<K extends Readonly<PropertyKey[]>>(
  element: unknown,
  prop: K,
): element is Record<K[number], unknown> {
  if (!isRecord(element)) {
    return false;
  }
  return prop.every((value) => value in element);
}

export type SnakeToCamelCase<Key extends string> =
  Key extends `${infer FirstPart}_${infer FirstLetter}${infer LastPart}`
    ? `${FirstPart}${Uppercase<FirstLetter>}${SnakeToCamelCase<LastPart>}`
    : Key;

export type SnakeToCamelCaseRecord<T, K extends keyof T = keyof T> = T extends Record<
  K,
  T[K]
>
  ? { [L in K as SnakeToCamelCase<L & string>]: SnakeToCamelCaseRecord<T[L]> }
  : T;
