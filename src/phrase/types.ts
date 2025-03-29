export type Maybe<T> = T | null | undefined;

export type Phrase<State, Data, Ctx> = {
  play(prev: Maybe<State>, data: Maybe<Data>, ctx: Ctx): Maybe<State>;
};

export type FactoryArgs<State, Data, Ctx, FullData = Data> = {
  create: (data: Data, ctx: Ctx) => State;
  update: (state: State, data: Data, ctx: Ctx) => State;
  destroy: (state: State, ctx: Ctx) => void;
  select?: (fullData: FullData) => Data;
};
