import * as phrase from "../build/dev/javascript/sonatina/phrase.mjs";
import type { Phrase as GleamPhrase } from "../build/dev/javascript/sonatina/phrase.d.mts";

type Phrase<FD, D, R, C> = Omit<GleamPhrase<FD, D, R, C>, "play"> & {
  play: (data?: FD, context?: C) => Phrase<FD, D, R, C>
}

import { Some, None, unwrap } from "../build/dev/javascript/gleam_stdlib/gleam/option.mjs";

export const Phrase = {
  compose: ({ select, create, update, destroy }: {
    select?: (fullData: any) => unknown,
    create?: (...args: any[]) => any,
    update?: (...args: any[]) => any,
    destroy?: (...args: any[]) => void,
  }) => decoratePlay(phrase.compose(
    select ? wrapSelect(select) : phrase.identity_selector,
    create ? new Some(wrapOptionals(create)) : new None(),
    update ? new Some(wrapOptionals(update)) : new None(),
    destroy ? new Some(destroy) : new None(),
  ))
};

const wrapSelect = (select: any) => (fullDataMaybe: any) => {
  const res = select(fullDataMaybe);
  return res !== null && res !== undefined ? new Some(res) : new None()
}

const wrapOptionals = (fn: any) => (...args: any[]) => {
  const res = fn(...(args.map(arg =>
    (arg instanceof Some || arg instanceof None) ? unwrap(arg, undefined) : arg
  )))

  return res;
}

const decoratePlay = (phrase: GleamPhrase<any, any, any, any>): Phrase<any, any, any, any> => {
  let play = phrase.play
  return {
    ...phrase,
    play: (data: any, context?: any) =>
      decoratePlay(play(
        data ? new Some(data) : new None(),
        context ? new Some(context) : new None(),
      ))
  } as Phrase<any, any, any, any>
}
