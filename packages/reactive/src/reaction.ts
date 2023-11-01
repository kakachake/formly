import { RawReactionMap, ReactionStack } from "./enviroment";
import { IOperation, PropertyKey, Reaction, ReactionsMap } from "./types";

const ITERATION_KEY = Symbol("iteration key");

export const bindTargetKeyWithCurrentReaction = (operation: IOperation) => {
  let { target, key, type } = operation;
  if (type === "iterate") {
    key = ITERATION_KEY;
  }
  const reactionLen = ReactionStack.length;
  if (reactionLen === 0) return;
  const current = ReactionStack[reactionLen - 1];

  if (current) {
    addReactionsMapToReaction(
      current,
      addRawReactionsMap(target, key, current)
    );
  }
};

export const runReactionsFromTargetKey = (operation: IOperation) => {
  let { key, type, target } = operation;
  runReactions(target, key);

  // 影响到了数组的长度或者对象的key
  if (type === "add" || type === "delete" || type === "clear") {
    const newKey = Array.isArray(target) ? "length" : ITERATION_KEY;
    runReactions(target, newKey);
  }
};

const runReactions = (target: any, key: PropertyKey) => {
  const reactions = getReactionsFromTargetKey(target, key);
  for (let i = 0, len = reactions.length; i < len; i++) {
    const reaction = reactions[i];
    reaction();
  }
};

const getReactionsFromTargetKey = (target: any, key: PropertyKey) => {
  const reactionsMap = RawReactionMap.get(target);
  const reactions = [];
  if (reactionsMap) {
    const map = reactionsMap.get(key);
    map.forEach((reaction) => {
      if (reactions.indexOf(reaction) === -1) {
        reactions.push(reaction);
      }
    });
  }
  return reactions;
};

const addReactionsMapToReaction = (
  reaction: Reaction,
  reactionsMap: ReactionsMap
) => {
  const bindSet = reaction._reactionsSet;
  if (bindSet) {
    bindSet.add(reactionsMap);
  } else {
    reaction._reactionsSet = new Set([reactionsMap]);
  }
  return bindSet;
};

// 将当前的reaction添加到reactionsMap中
const addRawReactionsMap = (
  target: any,
  key: PropertyKey,
  reaction: Reaction
) => {
  const reactionsMap = RawReactionMap.get(target);
  if (reactionsMap) {
    const reactions = reactionsMap.get(key);
    if (reactions) {
      reactions.add(reaction);
    } else {
      reactionsMap.set(key, new Set([reaction]));
    }
    return reactionsMap;
  } else {
    const reactionsMap: ReactionsMap = new Map([[key, new Set([reaction])]]);
    RawReactionMap.set(target, reactionsMap);
    return reactionsMap;
  }
};

// 重新绑定reaction
export const releaseBindingReactions = (reaction: Reaction) => {
  reaction._reactionsSet?.forEach((reactionsMap) => {
    reactionsMap.forEach((reactions) => {
      reactions.delete(reaction);
    });
  });
  delete reaction._reactionsSet;
};

export const disposeBindingReactions = (reaction: Reaction) => {
  releaseBindingReactions(reaction);
};
