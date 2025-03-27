import type { Loop, LoopState } from "./loop";

type Action = string;
type Payload = unknown;
type Signal = [Action, Payload];

type Score = {
  send: (signal: Signal) => Score;
};

type Context<A extends LoopState, B, C> = {
  state: unknown;
  rootState: LoopState | null;
  root: Loop<A, B, C>;
  api: Score;
  reducers: ((data: unknown, signal: Signal) => unknown)[];
  transformers: ((data: unknown) => unknown)[];
};

type Kernel = (signal: Signal) => void;

export default function Score(): Score {
  const $ = initialContext(kernel);

  function kernel(signal: Signal): void {
    $.state = $.reducers.reduce((acc, r) => r(acc, signal) ?? acc, $.state);
    const data = $.transformers.reduce((acc, t) => t(acc), $.state);
    $.rootState = $.root.sync($.rootState, data, $.api);
  }

  return $.api;
}

function initialContext<A extends LoopState, B, C>(
  kernel: Kernel,
  ctx = {} as Context<A, B, C>,
): Context<A, B, C> {
  return Object.assign(ctx, {
    state: {},
    reducers: [prelude(ctx)],
    transformers: [],
    api: {
      send(signal: Signal) {
        setTimeout(() => kernel(signal), 0);
        return ctx.api;
      },
    },
    root: null,
    rootState: null,
  });
}
