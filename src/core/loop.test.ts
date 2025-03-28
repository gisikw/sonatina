import { test, expect } from "vitest";
import { Loop } from "./loop";

test("correct dispatching to create/update/destroy", () => {
  const dispatches: string[] = [];
  const TestLoop = Loop({
    create() {
      dispatches.push("create");
      return {};
    },
    update(prev) {
      dispatches.push("update");
      return prev;
    },
    destroy() {
      dispatches.push("destroy");
    },
  });

  let loop;
  loop = TestLoop.sync(loop, {}, {});
  loop = TestLoop.sync(loop, {}, {});
  TestLoop.sync(loop, null, {});

  expect(dispatches).toEqual(["create", "update", "destroy"]);
});
