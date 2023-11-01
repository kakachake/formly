export type PropertyKey = string | number | symbol;

export type OperationType =
  | "add"
  | "delete"
  | "clear"
  | "set"
  | "get"
  | "iterate"
  | "has";

export interface IOperation {
  target?: any;
  key?: PropertyKey;
  value?: any;
  oldValue?: any;
  type?: OperationType;
  reciver?: any;
}

export type Reaction = ((...args: any[]) => any) & {
  // 保存哪些数据会触发当前的reaction
  _reactionsSet?: Set<ReactionsMap>;
  _name?: string;
};

export type ReactionsMap = Map<PropertyKey, Set<Reaction>>;
