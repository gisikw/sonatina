import type {
  Action,
  Payload,
  Reducer,
  Transformer,
  Loop,
  Score,
  PrivilegedReducer,
} from "./types";
import { CORE_ACTIONS } from "./constants";
const UNCHANGED = Symbol("unchanged");

export const prelude: PrivilegedReducer = (core): Reducer => {
  let rootArg: Loop<unknown, unknown, unknown>;
  core.root = {
    sync(): void {
      // NOOP
    },
  };

  const cue = {
    effect(action: Action, payload: Payload): void {
      core.cueState.effects.push([action, payload]);
    },
    unchanged: UNCHANGED,
  };

  const preludeReducer: Reducer = (state, [action, payload]) => {
    core.cueState = {
      effects: [],
      handled: false,
    };
    switch (action) {
      case CORE_ACTIONS.WITH_INITIAL_STATE:
        return payload;
      case CORE_ACTIONS.WITH_ROOT_LOOP:
        rootArg = payload as Loop<unknown, unknown, unknown>;
        break;
      case CORE_ACTIONS.WITH_REDUCERS:
        (payload as Reducer[]).forEach((reducer) => {
          addFluentMethods(core.api, reducer);
          core.reducers.push((state, signal) => {
            const res = reducer(state, signal, cue);
            if (res !== UNCHANGED) core.cueState.handled = true;
            return res;
          });
        });
        break;
      case CORE_ACTIONS.WITH_TRANSFORMERS:
        core.transformers.push(...(payload as Transformer[]));
        break;
      case CORE_ACTIONS.WITH_FORWARD_TARGET:
        core.forward = payload;
        break;
      case CORE_ACTIONS.START:
        if (!rootArg) {
          throw new Error(
            "Tenuto: Cannot start Score runtime - no root loop was configured.",
          );
        }
        core.root = rootArg;
        break;
    }

    return state;
  };

  preludeReducer.ACTIONS = [
    CORE_ACTIONS.WITH_ROOT_LOOP,
    CORE_ACTIONS.WITH_REDUCERS,
    CORE_ACTIONS.WITH_TRANSFORMERS,
    CORE_ACTIONS.WITH_FORWARD_TARGET,
    CORE_ACTIONS.WITH_INITIAL_STATE,
    CORE_ACTIONS.START,
  ];

  addFluentMethods(core.api, preludeReducer);

  return preludeReducer;
};

const addFluentMethods = (api: Score, reducer: Reducer): void => {
  for (const actionName of reducer.ACTIONS ?? []) {
    Object.assign(api, {
      [actionName]: (action: Action, payload: Payload) =>
        api.send(action, payload),
    });
  }
};
