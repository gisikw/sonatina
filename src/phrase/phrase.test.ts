import { test, expect } from "vitest";
import { Phrase } from "./phrase";

test("correct dispatching to create/update/destroy", () => {
  const dispatches: string[] = [];
  const TestPhrase = Phrase({
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

  let phrase;
  phrase = TestPhrase.play(phrase, {}, {});
  phrase = TestPhrase.play(phrase, {}, {});
  TestPhrase.play(phrase, null, {});

  expect(dispatches).toEqual(["create", "update", "destroy"]);
});
