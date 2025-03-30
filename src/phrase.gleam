import gleam/option.{type Option, None, Some}

pub type Phrase(state, data, context) {
  Phrase(
    play: fn(Option(state), Option(data), Option(context)) -> Option(state),
  )
}

pub fn identity_selector(arg) {
  Some(arg)
}

pub fn new(
  create create: fn(data, Option(context)) -> state,
  update update: fn(state, data, Option(context)) -> state,
  destroy destroy: fn(state, Option(context)) -> Nil,
  select select: fn(full_data) -> Option(data),
) -> Phrase(state, full_data, context) {
  Phrase(play: fn(prev, full_data, ctx) {
    let data = case full_data {
      Some(full_data) -> select(full_data)
      None -> None
    }

    case data {
      Some(data) ->
        case prev {
          None -> Some(create(data, ctx))
          Some(prev) -> Some(update(prev, data, ctx))
        }
      None ->
        case prev {
          Some(prev) -> {
            destroy(prev, ctx)
            None
          }
          None -> None
        }
    }
  })
}
