import { test, expect } from "vitest";
import { composeScore } from "./score";

test("send calls privileged reducer and root loop sync", async () => {
  let reducerCount = 0;
  let coreCount = 0;

  const fakeReducerOutput = "fakeReducerOutput";

  const Score = composeScore((core) => () => {
    core.root = {
      sync(_self, data) {
        expect(data).toBe(fakeReducerOutput);
        coreCount = coreCount + 1;
      },
    };
    reducerCount = reducerCount + 1;
    return fakeReducerOutput;
  });

  Score().send("fakeMessage", {}).send("fakeMessage2", {});

  await new Promise((r) => setTimeout(r, 0));

  expect(reducerCount).toBe(2);
  expect(coreCount).toBe(2);
});
