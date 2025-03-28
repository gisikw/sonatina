import type { Signal, Score, Reducer, Action, Payload, Core } from "./types";

export function composeScore(prelude: (core: Core) => Reducer) {
  return function Score(): Score {
    const $ = {} as Core;
    Object.assign($, {
      transformers: [],
      reducers: [prelude($)],
      api: {
        send(action: Action, payload: Payload) {
          setTimeout(() => kernel([action, payload]), 0);
          return $.api;
        },
      },
    });

    function kernel(signal: Signal): void {
      $.state = $.reducers.reduce((acc, r) => r(acc, signal) ?? acc, $.state);
      const data = $.transformers.reduce((acc, t) => t(acc), $.state);
      $.rootState = $.root.sync($.rootState, data, $.api);
    }

    return $.api;
  };
}
