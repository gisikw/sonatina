import { test, expect } from "vitest";
import { Phrase } from "../src/sonatina";
import { unwrap } from "../build/dev/javascript/gleam_stdlib/gleam/option.mjs";

test("dispatch create update destroy", () => {
  let subject = Phrase.compose({
    create: (data, _context) => [["create", data]],
    update: (_prev, data, retained, _context) => [["update", data], ...retained],
    destroy: (_retained, _context) => { },
  });

  subject = subject.play("data1");
  expect(unwrap(subject.retained, undefined)).toEqual([["create", "data1"]]);

  subject = subject.play("data2");
  expect(unwrap(subject.retained, undefined)).toEqual([["update", "data2"], ["create", "data1"]]);

  subject = subject.play();
  expect(unwrap(subject.retained, undefined)).toBeUndefined();


  subject = subject.play("data3");
  expect(unwrap(subject.retained, undefined)).toEqual([["create", "data3"]]);
});

test("dispatch create update destroy with select", () => {
  let subject = Phrase.compose({
    create: (data, _context) => [["create", data]],
    update: (_prev, data, retained, _context) => [["update", data], ...retained],
    destroy: (_retained, _context) => { },
    select: (full_data) => full_data?.[0],
  });

  subject = subject.play(["data1", "nonsense"]);
  expect(unwrap(subject.retained, undefined)).toEqual([["create", "data1"]]);

  subject = subject.play(["data2", "nonsense"]);
  expect(unwrap(subject.retained, undefined)).toEqual([["update", "data2"], ["create", "data1"]]);

  subject = subject.play();
  expect(unwrap(subject.retained, undefined)).toBeUndefined();


  subject = subject.play(["data3", "nonsense"]);
  expect(unwrap(subject.retained, undefined)).toEqual([["create", "data3"]]);
});
