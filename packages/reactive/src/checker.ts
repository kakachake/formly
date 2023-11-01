const toString = Object.prototype.toString;

export const isSet = (val: unknown): val is Set<any> =>
  val && val instanceof Set;
export const isMap = (val: unknown): val is Map<any, any> =>
  val && val instanceof Map;
export const isWeakMap = (val: unknown): val is WeakMap<any, any> =>
  val && val instanceof WeakMap;
export const isWeakSet = (val: unknown): val is WeakSet<any> =>
  val && val instanceof WeakSet;
export const isValid = (val: unknown) => val !== null && val !== undefined;
export const isArr = Array.isArray;
export const isFn = (val: unknown): val is () => any =>
  typeof val === "function";

export const isPlainObject = (val: unknown) =>
  toString.call(val) === "[object Object]";

export const isNormalType = (target: any) => {
  return isPlainObject(target) || isArr(target);
};

export const isCollectionType = (target: any) => {
  return (
    isSet(target) || isMap(target) || isWeakMap(target) || isWeakSet(target)
  );
};
