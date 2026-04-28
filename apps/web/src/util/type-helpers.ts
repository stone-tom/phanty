import { omit, pick } from 'lodash';
import type { Finite, IsLiteral, Simplify, Writable } from 'type-fest';

export function isNullish(value: unknown): value is null | undefined {
  return value === undefined || value === null;
}

export function isNotNullish<TValue>(
  value?: TValue | null | undefined,
): value is NonNullable<TValue> {
  return value !== undefined && value !== null;
}

export function isTruthy<TValue>(
  value?: TValue | false | 0 | '' | null | undefined,
): value is TValue {
  return Boolean(value);
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isFiniteNumber(value: unknown): value is Finite<number> {
  return Number.isFinite(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isEmptyString(value: unknown): value is string {
  return isString(value) && value.length === 0;
}

export function isArray<T>(
  value: unknown,
  predicate: (value: unknown) => boolean,
): value is T[] {
  return Array.isArray(value) && value.every((element) => predicate(element));
}

export function isNumberArray(value: unknown): value is number[] {
  return isArray(value, isNumber);
}

export function isStringArray(value: unknown): value is string[] {
  return isArray(value, isString);
}

export function isNode(value: EventTarget | null): value is Node {
  return value !== null && 'nodeType' in value;
}

export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

/**
 * Marks array access via index as possibly undefined.
 * Similar to the TS global flag `noUncheckedIndexedAccess`.
 */
export function safeIndexAccess<T extends Array<unknown>, I extends number>(
  array: T,
  index: I,
): T[I] | undefined {
  return array[index];
}

/**
 * Returns the value of the object at the given key, or undefined if the key
 * does not exist.
 */
export const safeLookup = <const TObject, const TKey>(
  obj: TObject,
  key: TKey,
): TKey extends keyof TObject
  ? TObject[TKey]
  : IsLiteral<TKey> extends true
    ? never
    : TObject[keyof TObject] | undefined => {
  return (obj as object)[key as keyof object];
};

/** Strictly typed wrapper for lodash/pick */
export const typedPick = <TObject extends object, TKey extends keyof TObject>(
  object: TObject,
  keys: Array<TKey> | ReadonlyArray<TKey>,
): Simplify<Pick<TObject, TKey>> => pick(object, keys);

/** Strictly typed wrapper for lodash/omit */
export const typedOmit = <TObject extends object, TKey extends keyof TObject>(
  object: TObject,
  keys: Array<TKey> | ReadonlyArray<TKey>,
): Simplify<Omit<TObject, TKey>> => omit(object, keys);

/** Casts given value as a mutable type */
export const asWritable = <TValue>(value: TValue): Writable<TValue> =>
  value as Writable<TValue>;

/**
 * Strongly-typed wrapper around `Object.fromEntries()`.
 * Useful since `Object.fromEntries()` does not infer the literal type of the keys and
 * always returns `{ [k: string]: T }`.
 */
export const typedFromEntries = <
  const TEntries extends ReadonlyArray<readonly [PropertyKey, unknown]>,
  TObject = { [K in TEntries[number] as K[0]]: K[1] },
>(
  entries: TEntries,
): TObject => Object.fromEntries(entries) as TObject;
