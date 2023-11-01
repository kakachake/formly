import { ObModelSymbol, RawNode } from "./enviroment";
import { getRaw } from "./externals";
import { PropertyKey } from "./types";

export const buildDataTree = (target: any, key: PropertyKey, value: any) => {
  const raw = getRaw(value);
  const currentNode = getDataNode(raw);
  if (currentNode) return currentNode;
  setDataNode(raw, new DataNode(target, key, value));
};

export class DataNode {
  target: any;
  key: PropertyKey;
  value: any;

  constructor(target: any, key: PropertyKey, value: any) {
    this.target = target;
    this.key = key;
    this.value = value;
  }

  get path() {
    if (!this.parent) return this.key ? [this.key] : [];
    return this.parent.path.concat(this.key);
  }

  get targetRaw() {
    return getRaw(this.target);
  }

  get parent() {
    if (!this.target) return;
    return getDataNode(this.targetRaw);
  }
}

export const setDataNode = (raw: any, node: DataNode) => {
  if (raw?.[ObModelSymbol]) {
    raw[ObModelSymbol] = node;
    return;
  }
  RawNode.set(raw, node);
};

export const getDataNode = (raw: any) => {
  if (raw?.[ObModelSymbol]) {
    return raw[ObModelSymbol];
  }
  return RawNode.get(raw);
};
