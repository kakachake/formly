import { isFn } from "./checker";
import { ReactionStack } from "./enviroment";
import { disposeBindingReactions, releaseBindingReactions } from "./reaction";
import { Reaction } from "./types";

export const autorun = (tracker: Reaction, name: "AutoRun") => {
  const reaction: Reaction = () => {
    if (!isFn(tracker)) return;
    if (ReactionStack.indexOf(reaction) === -1) {
      releaseBindingReactions(reaction);
      try {
        // 将当前的reaction添加到栈中, 用于后续的依赖收集
        ReactionStack.push(reaction);
        tracker();
      } finally {
        ReactionStack.pop();
      }
    }
  };
  reaction._name = name;
  reaction();
  return () => {
    disposeBindingReactions(reaction);
  };
};
