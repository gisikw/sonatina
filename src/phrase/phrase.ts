import type { Phrase, FactoryArgs, Maybe } from "./types";

export function Phrase<State, Data, Ctx, FullData = Data>(
  args: FactoryArgs<State, Data, Ctx, FullData>,
): Phrase<State, Data, Ctx> {
  const { create, update, destroy, select } = args;
  return {
    play(prev, fullData, ctx): Maybe<State> {
      if (fullData) {
        const data = select
          ? select(fullData as unknown as FullData)
          : fullData;
        return prev ? update(prev, data, ctx) : create(data, ctx);
      }
      if (prev) destroy(prev, ctx);
    },
  };
}
