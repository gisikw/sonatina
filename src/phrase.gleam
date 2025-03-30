import gleam/option.{type Option, None, Some}

pub type Phrase(state, data, context) {
  Phrase(
    play: fn(Option(state), Option(data), Option(context)) -> Option(state),
  )
}

pub fn new(
  create create: fn(data, Option(context)) -> state,
  update update: fn(state, data, Option(context)) -> state,
  destroy destroy: fn(state, Option(context)) -> Nil,
) -> Phrase(state, data, context) {
  Phrase(play: fn(prev, data, ctx) {
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

pub type SelectedPhrase(state, full_data, context) {
  SelectedPhrase(
    play: fn(Option(state), Option(full_data), Option(context)) -> Option(state),
  )
}

pub fn with_selector(
  phrase phrase: Phrase(state, data, context),
  select select: fn(full_data) -> Option(data),
) {
  SelectedPhrase(play: fn(prev, full_data, ctx) {
    case full_data {
      Some(full_data) -> phrase.play(prev, select(full_data), ctx)
      None -> phrase.play(prev, None, ctx)
    }
  })
}
