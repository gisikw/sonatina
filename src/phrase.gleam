import gleam/option.{type Option, None, Some}

pub type Phrase(full_data, data, retained, context) {
  Phrase(
    select: fn(full_data) -> Option(data),
    create: Option(fn(data, Option(context)) -> retained),
    update: Option(
      fn(data, data, Option(retained), Option(context)) -> retained,
    ),
    destroy: Option(fn(Option(retained), Option(context)) -> Nil),
    retained: Option(retained),
    prev: Option(data),
    play: fn(Option(full_data), Option(context)) ->
      Phrase(full_data, data, retained, context),
  )
}

pub fn identity_selector(a) {
  Some(a)
}

pub fn compose(select select, create create, update update, destroy destroy) {
  wrap(select, create, update, destroy, None, None)
}

fn wrap(select, create, update, destroy, retained, prev) {
  Phrase(
    select:,
    create:,
    update:,
    destroy:,
    retained:,
    prev:,
    play: fn(full_data, context) {
      play(select, create, update, destroy, retained, prev, full_data, context)
    },
  )
}

fn play(select, create, update, destroy, retained, prev, full_data, context) {
  let selected_data = case full_data {
    Some(full_data) -> select(full_data)
    None -> None
  }

  let retained = case selected_data {
    Some(data) ->
      case prev {
        None ->
          case create {
            Some(create) -> Some(create(data, context))
            None -> retained
          }
        Some(prev) ->
          case data == prev {
            True -> retained
            False ->
              case update {
                Some(update) -> Some(update(prev, data, retained, context))
                None -> retained
              }
          }
      }
    None ->
      case prev {
        Some(_) ->
          case destroy {
            Some(destroy) -> {
              destroy(retained, context)
              None
            }
            None -> retained
          }
        None -> retained
      }
  }

  wrap(select, create, update, destroy, retained, selected_data)
}
