import { test, expect } from "vitest";
import { prelude } from "./prelude";
import type { Core } from "./types";

test("adds fluent methods to core api on initialization", () => {
  const api = {};
  prelude({ api } as Core);

  expect(api).toHaveProperty("withReducers");
  expect(api).toHaveProperty("withTransformers");
  expect(api).toHaveProperty("withInitialState");
  expect(api).toHaveProperty("withForwardTarget");
  expect(api).toHaveProperty("withRootLoop");
  expect(api).toHaveProperty("start");
});
