export type LoopState = {
  echo?: unknown;
  sustain?: unknown;
};

export type Loop<State extends LoopState, Data, Ctx> = {
  sync(prev: State | null, data: Data | null, ctx: Ctx): State | null;
};

type FactoryArgs<State, Data, Ctx, FullData = Data> = {
  create: (data: Data, ctx: Ctx) => State;
  update: (state: State, data: Data, ctx: Ctx) => State;
  destroy: (state: State, ctx: Ctx) => void;
  select?: (fullData: FullData) => Data;
};

export default function Loop<
  State extends LoopState,
  Data,
  Ctx,
  FullData = Data,
>(args: FactoryArgs<State, Data, Ctx, FullData>): Loop<State, Data, Ctx> {
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
