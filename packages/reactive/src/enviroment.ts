import { DataNode } from "./tree";
import { Reaction, ReactionsMap } from "./types";

export const ProxyRaw = new WeakMap();
export const RawProxy = new WeakMap();
export const RawShallowProxy = new WeakMap();
export const ObModelSymbol = Symbol("ObModelSymbol");
export const RawNode = new WeakMap<object, DataNode>();
export const RawReactionMap = new WeakMap<object, ReactionsMap>();

export const ReactionStack: Reaction[] = [];
