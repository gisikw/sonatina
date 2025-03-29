import type { Score, Core } from "./types";

export function Score(): Score {
  const core: Core = {
    reducers: [],
    state: {},
    cue: {},
    api: {
      compose: (plugin) => plugin(core).api,
      send(action, payload) {
        setTimeout(() => core.motif([action, payload]), 0);
        return core.api;
      },
    },
    motif: (signal) => {
      core.state = core.reducers.reduce(
        (acc, r) => r(acc, signal, core.cue),
        core.state,
      );
    },
  };
  return core.api;
}
