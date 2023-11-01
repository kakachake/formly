import { ProxyRaw, RawProxy } from "./enviroment";
import { isObservable, isSupportObservable } from "./externals";
import { createObservable } from "./internals";
import {
  bindTargetKeyWithCurrentReaction,
  runReactionsFromTargetKey,
} from "./reaction";

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const baseHandlers: ProxyHandler<any> = {
  get(target, key, reciver) {
    if (!key) return;
    const result = target[key];
    if (typeof key === "symbol" && wellKnownSymbols.has(key)) return result;
    // 将当前的target和key绑定到当前的reaction中
    bindTargetKeyWithCurrentReaction({
      target,
      key,
      reciver,
      type: "get",
    });
    const observableResult = RawProxy.get(result);
    if (observableResult) {
      return observableResult;
    }
    if (!isObservable(result) && isSupportObservable(result)) {
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (
        !descriptor ||
        !(descriptor.value === false && descriptor.configurable === false)
      ) {
        return createObservable(target, key, result);
      }
    }
    return result;
  },
  has(target, key) {
    const result = Reflect.has(target, key);
    bindTargetKeyWithCurrentReaction({
      target,
      key,
      type: "has",
    });
    return result;
  },
  ownKeys(target) {
    const result = Reflect.ownKeys(target);
    bindTargetKeyWithCurrentReaction({
      target,
      type: "iterate",
    });
    return result;
  },
  set(target, key, value, reciver) {
    const hadKey = hasOwnProperty.call(target, key);
    const newValue = createObservable(target, key, value);
    const oldValue = target[key];
    target[key] = newValue;
    if (!hadKey) {
      runReactionsFromTargetKey({
        target,
        key,
        value: newValue,
        oldValue,
        reciver,
        type: "add",
      });
    } else if (value !== oldValue) {
      runReactionsFromTargetKey({
        target,
        key,
        value: newValue,
        oldValue,
        reciver,
        type: "set",
      });
    }
    return true;
  },
  deleteProperty(target, key) {
    const oldValue = target[key];
    delete target[key];
    runReactionsFromTargetKey({
      target,
      key,
      oldValue,
      type: "delete",
    });
    return true;
  },
};

// 对于map、set、weakmap、weakset的处理来说，需要对其进行特殊的处理
export const collectionHandlers = {
  // 这些类型都是通过内部的函数来进行操作的，所以需要对这些函数进行拦截
  get(target: any, key: PropertyKey, reciver: any) {
    target = hasOwnProperty.call(instrumentations, key)
      ? instrumentations
      : target;
    return Reflect.get(target, key, reciver);
  },
};

const instrumentations = {
  has(key: PropertyKey) {
    const target = ProxyRaw.get(this);
    bindTargetKeyWithCurrentReaction({
      target,
      key,
      type: "has",
    });
    return target.has(key);
  },
};

const wellKnownSymbols = new Set(
  Object.getOwnPropertyNames(Symbol).reduce((act: symbol[], key) => {
    if (key === "arguments") return act;
    if (key === "caller") return act;
    const value = (Symbol as any)[key];
    if (typeof value === "symbol") act.push(value);
    return act;
  }, [])
);
