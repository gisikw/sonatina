export type Maybe<T> = T | null | undefined;

export type Action = string;
export type Payload = unknown;
export type Signal = [Action, Payload];

type ReducerFn = (data: unknown, signal: Signal) => unknown;
export type Reducer = ReducerFn & { ACTIONS?: Action[] };
export type PrivilegedReducer = (core: Core) => Reducer;

export type Transformer = (data: unknown) => unknown;

export type LoopState = {
  echo?: unknown;
  sustain?: unknown;
};

export type Loop<State, Data, Ctx> = {
  sync(prev: Maybe<State>, data: Maybe<Data>, ctx: Ctx): Maybe<State>;
};

export type Score = {
  send: (action: Action, payload: Payload) => Score;
};

export type Core = {
  state: unknown;
  rootState: unknown;
  root: Loop<unknown, unknown, unknown>;
  api: Score;
  reducers: Reducer[];
  transformers: Transformer[];
};
