import type { Loop, Maybe } from "./types";

type FactoryArgs<State, Data, Ctx, FullData = Data> = {
  create: (data: Data, ctx: Ctx) => State;
  update: (state: State, data: Data, ctx: Ctx) => State;
  destroy: (state: State, ctx: Ctx) => void;
  select?: (fullData: FullData) => Data;
};

export function Loop<State, Data, Ctx, FullData = Data>(
  args: FactoryArgs<State, Data, Ctx, FullData>,
): Loop<State, Data, Ctx> {
  const { create, update, destroy, select } = args;
  return {
    sync(prev, fullData, ctx): Maybe<State> {
      if (fullData) {
        const data = select ? select(fullData as FullData) : fullData;
        return prev ? update(prev, data, ctx) : create(data, ctx);
      }
      if (prev) destroy(prev, ctx);
    },
  };
}
