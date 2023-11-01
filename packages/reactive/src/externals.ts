import {
  isArr,
  isCollectionType,
  isFn,
  isPlainObject,
  isValid,
} from "./checker";
import { ObModelSymbol, ProxyRaw } from "./enviroment";

const RAW_TYPE = Symbol("RAW_TYPE");
const OBSERVABLE_TYPE = Symbol("OBSERVABLE_TYPE");

export const isObservable = (target: any) => {
  return ProxyRaw.get(target) || !!target?.[ObModelSymbol];
};

export const isSupportObservable = (target: any) => {
  if (!isValid(target)) return false;
  if (isArr(target)) return true;
  if (isPlainObject(target)) {
    // 如果已经是observable对象，直接返回
    if (target[RAW_TYPE]) {
      return false;
    }

    //
    if (target[OBSERVABLE_TYPE]) {
      return true;
    }

    if (isFn(target["toJSON"]) || isFn(target["toJS"])) {
      return false;
    }

    return true;
  }
  if (isCollectionType(target)) return true;

  return false;
};

export const getRaw = <T>(target: T): T => {
  if (target?.[ObModelSymbol]) return target[ObModelSymbol];
  return ProxyRaw.get(target as any) || target;
};
