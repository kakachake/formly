import { ProxyRaw, RawProxy, RawShallowProxy } from "./enviroment";
import { isSupportObservable } from "./externals";
import { baseHandlers, collectionHandlers } from "./handlers";
import { buildDataTree } from "./tree";
import { PropertyKey } from "./types";
import { isCollectionType, isNormalType } from "./checker";

export const createObservable = (
  target?: any,
  key?: PropertyKey,
  value?: any,
  shallow?: boolean
) => {
  // 非object类型直接返回
  if (typeof value !== "object") return value;

  if (!isSupportObservable(value)) return value;

  if (target) {
    const parentRaw = ProxyRaw.get(target) || target;
    const isShallowParent = RawShallowProxy.get(parentRaw);
    if (isShallowParent) return value;
  }

  buildDataTree(target, key, value);
  if (shallow) return createShallowProxy(value);
  if (isNormalType(value)) return createNormalProxy(value);
  if (isCollectionType(value)) return createCollectionProxy(value);
  return value;
};

const createShallowProxy = (target: any) => {
  if (isNormalType(target)) return createNormalProxy(target, true);
  if (isCollectionType(target)) return createCollectionProxy(target, true);
  // never reach
  return target;
};

const createNormalProxy = (target: any, shallow?: boolean) => {
  const proxy = new Proxy(target, baseHandlers);
  ProxyRaw.set(proxy, target);
  if (shallow) {
    RawShallowProxy.set(target, proxy);
  } else {
    RawProxy.set(target, proxy);
  }
  return proxy;
};

const createCollectionProxy = (target: any, shallow?: boolean) => {
  const proxy = new Proxy(target, collectionHandlers);
  ProxyRaw.set(proxy, target);
  if (shallow) {
    RawShallowProxy.set(target, proxy);
  } else {
    RawProxy.set(target, proxy);
  }
  return proxy;
};
