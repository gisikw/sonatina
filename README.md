# 🎼 Sonatina

[![Package Version](https://img.shields.io/hexpm/v/sonatina)](https://hex.pm/packages/sonatina)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/sonatina/)
[![NPM Package Version](https://img.shields.io/npm/v/sonatina)](https://www.npmjs.com/package/sonatina)

**Sonatina** is a small library for composing declarative state and imperative behaviors.  
It helps you reconcile changes to application state with side effects and mutations - cleanly and predictably.

> ⚠️ **Warning: This project is still experimental.**
>
> This project is an experiment to suss out the viability of maintaining a
> shared runtime utility that simultaneously supports the BEAM and
> JavaScript/TypeScript, primarily written in Gleam. Expect churn!

---

## 🧱 Core Components

### `Phrase`

A Phrase encapsulates a declarative lifecycle - create, update, and destroy -
driven by a focused slice of application state you define with a selector.
It reconciles state changes through `.play()`

This makes `Phrase` ideal for managing lifecycle-bound logic, like animations, renderables, subscriptions, etc.

#### TypeScript
```ts
import { Phrase } from "sonatina";
import * as PIXI from "pixi.js";

// Create a Pixi application
const app = new PIXI.Application();
document.body.appendChild(app.view);

// Compose a Phrase to manage a PIXI.Text element
let phrase = Phrase.compose({
  select: (data) => data.label, // Watch just the label field

  create: (text, { app }) => {
    const label = new PIXI.Text(text);
    app.stage.addChild(label);
    return label;
  },

  update: (_prev, text, label) => {
    label.text = text;
    return label;
  },

  destroy: (label, { app }) => {
    app.stage.removeChild(label);
  },
});

// Simulated app state
let state = { label: "Hello" };
phrase = phrase.play(state, { app }); // -> create

state = { label: "World" };
phrase = phrase.play(state, { app }); // -> update

state = {};
phrase = phrase.play(state, { app }); // -> destroy
```

#### Gleam
```gleam
import gleam/option.{ Option, Some, None, unwrap }
import gleam/otp.{ actor, process }
import sonatina/phrase

pub fn run() {
  let phrase =
    phrase.compose(
      select: Some(fn(app) {
        case app {
          AppState(label) -> Some(label)
        }
      }),
      create: Some(fn(label, _ctx) {
        let assert Ok(pid) = actor.start(label, handle_message)
        pid
      }),
      update: Some(fn(_prev, label, pid, _ctx) {
        process.send(unwrap(pid, process.self()), label)
        unwrap(pid, process.self())
      }),
      destroy: Some(fn(pid, _ctx) {
        process.send(unwrap(pid, process.self()), "shutdown")
      }),
    )

  let state1 = Some(AppState("first"))
  let phrase = phrase.play(state1, None)

  let state2 = Some(AppState("second"))
  let phrase = phrase.play(state2, None)

  let phrase = phrase.play(None, None)
}
```

---

## 📦 Install

### JavaScript/TypeScript
```bash
pnpm add sonatina
# or
npm install sonatina
# or
yarn add sonatina
```

### Gleam
```bash
gleam add sonatina@0.1.1
```

---

## 🛣️ Roadmap

This is an early release focused on `Phrase`.  
The runtime (`Score`) and plugin system are coming soon in future minor versions.

---

## 📜 License

Apache 2.0 © Kevin Gisi
