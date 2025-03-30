import gleeunit
import gleeunit/should

import gleam/list
import gleam/option.{None, Some}
import phrase

pub fn main() {
  gleeunit.main()
}

pub fn dispatch_create_update_destroy_test() {
  let test_phrase =
    phrase.new(
      create: fn(data, _context) { [["create", data]] },
      update: fn(state, data, _context) { [["update", data], ..state] },
      destroy: fn(_state, _context) { Nil },
      select: phrase.identity_selector,
    )

  let state = None
  let state = test_phrase.play(state, Some("data1"), None)
  state |> should.equal(Some([["create", "data1"]]))

  let state = test_phrase.play(state, Some("data2"), None)
  state |> should.equal(Some([["update", "data2"], ["create", "data1"]]))

  let state = test_phrase.play(state, None, None)
  state |> should.equal(None)

  let state = test_phrase.play(state, Some("data3"), None)
  state |> should.equal(Some([["create", "data3"]]))
}

pub fn dispatch_create_update_destroy_with_select_test() {
  let test_phrase =
    phrase.new(
      create: fn(data, _context) { [["create", data]] },
      update: fn(state, data, _context) { [["update", data], ..state] },
      destroy: fn(_state, _context) { Nil },
      select: fn(full_data) {
        case list.first(full_data) {
          Ok(result) -> Some(result)
          _ -> None
        }
      },
    )

  let state = None
  let state = test_phrase.play(state, Some(["data1", "nonsense"]), None)
  state |> should.equal(Some([["create", "data1"]]))

  let state = test_phrase.play(state, Some(["data2", "nonsense"]), None)
  state |> should.equal(Some([["update", "data2"], ["create", "data1"]]))

  let state = test_phrase.play(state, None, None)
  state |> should.equal(None)

  let state = test_phrase.play(state, Some(["data3", "nonsense"]), None)
  state |> should.equal(Some([["create", "data3"]]))
}
