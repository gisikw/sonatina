import gleeunit
import gleeunit/should

import gleam/list
import gleam/option.{None, Some, unwrap}
import phrase

pub fn main() {
  gleeunit.main()
}

pub fn dispatch_create_update_destroy_test() {
  let subject =
    phrase.compose(
      create: Some(fn(data, _context) { [["create", data]] }),
      update: Some(fn(_prev, data, retained, _context) {
        [["update", data], ..unwrap(retained, [])]
      }),
      destroy: Some(fn(_retained, _context) { Nil }),
      select: phrase.identity_selector,
    )

  let subject = subject.play(Some("data1"), None)
  subject.retained |> should.equal(Some([["create", "data1"]]))

  let subject = subject.play(Some("data2"), None)
  subject.retained
  |> should.equal(Some([["update", "data2"], ["create", "data1"]]))

  let subject = subject.play(Some("data2"), None)
  subject.retained
  |> should.equal(Some([["update", "data2"], ["create", "data1"]]))

  let subject = subject.play(None, None)
  subject.retained |> should.equal(None)

  let subject = subject.play(Some("data3"), None)
  subject.retained |> should.equal(Some([["create", "data3"]]))
}

pub fn dispatch_create_update_destroy_with_select_test() {
  let subject =
    phrase.compose(
      create: Some(fn(data, _context) { [["create", data]] }),
      update: Some(fn(_prev, data, retained, _context) {
        [["update", data], ..unwrap(retained, [])]
      }),
      destroy: Some(fn(_retained, _context) { Nil }),
      select: fn(full_data) {
        case list.first(full_data) {
          Ok(result) -> Some(result)
          _ -> None
        }
      },
    )

  let subject = subject.play(Some(["data1", "nonsense"]), None)
  subject.retained |> should.equal(Some([["create", "data1"]]))

  let subject = subject.play(Some(["data2", "nonsense"]), None)
  subject.retained
  |> should.equal(Some([["update", "data2"], ["create", "data1"]]))

  let subject = subject.play(None, None)
  subject.retained |> should.equal(None)

  let subject = subject.play(Some(["data3", "nonsense"]), None)
  subject.retained |> should.equal(Some([["create", "data3"]]))
}
