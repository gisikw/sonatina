export type RACState = {
  memo: unknown;
  retained?: unknown;
};

type RAC<State extends RACState, Data, Ctx> = {
  sync(prev: State | null, data: Data | null, ctx: Ctx): State | null;
};

type FactoryArgs<State, Data, Ctx, FullData = Data> = {
  create: (data: Data, ctx: Ctx) => State;
  update: (state: State, data: Data, ctx: Ctx) => State;
  destroy: (state: State, ctx: Ctx) => void;
  select?: (fullData: FullData) => Data;
};

function RAC<State extends RACState, Data, Ctx, FullData = Data>(
  args: FactoryArgs<State, Data, Ctx, FullData>,
): RAC<State, Data, Ctx> {
  const { create, update, destroy, select } = args;
  return {
    sync(prev, fullData, ctx): State | null {
      if (fullData) {
        const data = (
          select ? select(fullData as unknown as FullData) : fullData
        ) as Data;
        if (prev) return update(prev, data, ctx);
        else return create(data, ctx);
      } else if (prev) destroy(prev, ctx);
      return null;
    },
  };
}

const RUNTIME_ACTIONS = {
  WITH_REDUCERS: "withReducers",
  WITH_TRANSFORMERS: "withTransformers",
  WITH_FORWARD_TARGET: "withForwardTarget",
  WITH_ROOT_RAC: "withRootRac",
  WITH_INITIAL_STATE: "withInitialState",
  START: "start",
} as const;

type Action = string;
type Payload = unknown;
type Signal = [Action, Payload];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IntermediateState = any;
type Frame = {
  state: IntermediateState;
  handled: boolean | string;
  effects: Signal[];
};

type ReducerFn = (
  state: IntermediateState,
  signal: Signal,
) => IntermediateState | Frame | null;
type Reducer = ReducerFn & { ACTIONS?: string[] };

type Transformer = (state: IntermediateState) => IntermediateState;

type EffectHandler = (payload: Payload, runtime: Runtime) => void;

type Runtime = {
  send: (action: Action, payload: Payload) => Runtime;
};

type RuntimeContext<RootState extends RACState, RootData, RootCtx> = {
  reducers: Reducer[];
  transformers: Transformer[];
  effectHandlers: Record<string, EffectHandler>;
  Rac?: RAC<RootState, RootData, RootCtx>;
  runtime: Runtime;
  started: boolean;
};

export type RootContext = {
  send: (action: Action, payload: Payload) => void;
};

function RacRuntime<
  RuntimeState,
  RootState extends RACState,
  RootData,
  RootCtx,
>(): Runtime {
  let state: RuntimeState | null;
  let root: RootState | null;

  const preludeReducer = (state: RuntimeState, signal: Signal): Frame | null =>
    prelude(state, signal, ctx);
  const codaReducer = (frame: Frame, signal: Signal): RuntimeState | null =>
    coda(frame, signal, ctx);

  const ctx: RuntimeContext<RootState, RootData, RootCtx> = {
    reducers: [preludeReducer, codaReducer],
    transformers: [],
    effectHandlers: {},
    started: false,
    runtime: [...prelude.ACTIONS, ...coda.ACTIONS].reduce(
      (acc, action) => ({
        ...acc,
        [action]: (payload: Payload) => ctx.runtime.send(action, payload),
      }),
      {
        send(action: Action, payload: Payload) {
          setTimeout(() => dispatch([action, payload]), 0);
          return ctx.runtime;
        },
      },
    ),
  };

  function dispatch(signal: Signal): void {
    state = ctx.reducers.reduce((acc, r) => r(acc, signal), state);
    const data = ctx.transformers.reduce((acc, t) => t(acc), state);
    if (!ctx.started || !ctx.Rac || !data) return;
    root = ctx.Rac.sync(
      root,
      data as RootData,
      { send: ctx.runtime.send } as RootCtx,
    );
  }

  return ctx.runtime;
}

function prelude<RuntimeState, RootState extends RACState, RootData, RootCtx>(
  state: RuntimeState,
  [action, payload]: Signal,
  ctx: RuntimeContext<RootState, RootData, RootCtx>,
): Frame | null {
  switch (action) {
    case RUNTIME_ACTIONS.WITH_REDUCERS:
      ctx.reducers.splice(
        ctx.reducers.length - 1,
        0,
        ...(payload as Reducer[]),
      );
      for (const reducer of payload as Reducer[]) {
        for (const action of reducer.ACTIONS || []) {
          Object.assign(ctx.runtime, {
            [action]: (payload: Payload) => ctx.runtime.send(action, payload),
          });
        }
      }
      return { state, handled: true, effects: [] };
    case RUNTIME_ACTIONS.WITH_TRANSFORMERS:
      ctx.transformers.push(...(payload as Transformer[]));
      return { state, handled: true, effects: [] };
    case RUNTIME_ACTIONS.WITH_FORWARD_TARGET:
      ctx.effectHandlers["forward"] = payload as EffectHandler;
      return { state, handled: true, effects: [] };
    case RUNTIME_ACTIONS.WITH_ROOT_RAC:
      ctx.Rac = payload as RAC<RootState, RootData, RootCtx>;
      return { state, handled: true, effects: [] };
    case RUNTIME_ACTIONS.WITH_INITIAL_STATE:
      return { state: payload, handled: true, effects: [] };
    case RUNTIME_ACTIONS.START:
      ctx.started = true;
      return { state, handled: true, effects: [] };
  }
  return { state, handled: false, effects: [] };
}
prelude.ACTIONS = [
  RUNTIME_ACTIONS.WITH_REDUCERS,
  RUNTIME_ACTIONS.WITH_TRANSFORMERS,
  RUNTIME_ACTIONS.WITH_FORWARD_TARGET,
  RUNTIME_ACTIONS.WITH_ROOT_RAC,
  RUNTIME_ACTIONS.WITH_INITIAL_STATE,
  RUNTIME_ACTIONS.START,
];

function coda<RuntimeState, RootState extends RACState, RootData, RootCtx>(
  frame: Frame,
  signal: Signal,
  ctx: RuntimeContext<RootState, RootData, RootCtx>,
): RuntimeState | null {
  const { state, handled, effects } = frame;
  if (!handled || handled === "optimistic") effects.push(["forward", signal]);
  setTimeout(() => {
    effects.forEach(([action, payload]) =>
      ctx.effectHandlers[action]?.(payload, ctx.runtime),
    );
  }, 0);
  if (!handled) return null;
  return state;
}
coda.ACTIONS = [] as string[];

RAC.Runtime = RacRuntime;
export default RAC;
