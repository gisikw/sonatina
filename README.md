# Tenuto

**Declarative state meets sustained, imperative behavior.**

Tenuto is a small framework for managing application state and rendering. It bridges unidirectional dataflow with imperative side effects by combining a central `Score` (runtime) with retained, stateful `Loops`.

It was designed to support scenarios where:
- State is derived declaratively via reducers and transformers
- Rendering and effects are performed imperatively
- Components need to persist internal state across updates

The result is a clean architecture for sustaining logic over time, without giving up full control.

> ⚠️ **Warning: This project is still taking shape.**
>
> Tenuto is in early development and is currently being ported from a reference implementation.
> The API and behavior may change, and portions of the README may not yet reflect the current code.

---

## ✨ Features

- ⚙️ **Score-based orchestration** — All changes flow through a central conductor
- 🔁 **Retained Loops** — Stateful rendering units with `create`, `update`, `destroy` lifecycles
- 📥 **Signal-driven** — Reducers receive `[action, payload]` messages
- 🧱 **Composable transforms** — Layer state evolution with reducer and transformer chains
- 🎯 **Effect isolation** — Side effects are deferred and context-aware

---

## 🚀 Getting Started

```bash
pnpm add tenuto
```

---

## 🧠 Core Concepts

### `Score()`

The central orchestrator. It handles signals, applies reducers, transforms state, and syncs Loops.

```ts
import { Score } from "tenuto";

Score()
  .withReducers([yourReducer])
  .withTransformers([yourTransformer])
  .withRootLoop(AppLoop)
  .withInitialState(initialState)
  .start();
```

### 🔁 `Loop(...)`

**Loops are the core primitive of Tenuto.**  
They represent **retained, reactive units** of behavior—like components, reducers, or GenServers—that respond to changing data over time.

A `Loop` defines three lifecycle methods:

- `create(data, ctx)` – when first instantiated  
- `update(state, data, ctx)` – on subsequent updates  
- `destroy(state, ctx)` – when removed

Once defined, a Loop exposes a single method:

```ts
const loop = MyLoop.sync(state, data, ctx);
```

You can think of `Loop.sync(...)` like a **pure render function with memory**. It returns the next version of the loop's internal state based on the input.

Because the return value is explicit, you can treat Loops like:

- 🧱 **Declarative components**  
  They react to external data and return new state

- 🧠 **Reducers with memory**  
  Their logic is deterministic, but their retention isn't

- 🛰️ **Minimal actors or GenServers**  
  They handle their own state and side effects

---

#### ⏳ Loops persist across time

Because sync is explicit, you're responsible for tracking and persisting your loops.

```ts
this.appLoop = AppLoop.sync(this.appLoop, nextData, ctx);
```

This gives you full control over whether a loop should live, update, or be discarded.

---

#### ⚙️ Loops are composable

You can compose Loops within each other by calling `.sync()` on child loops from a parent’s `create`/`update` logic.

This enables structured, layered behavior:

```ts
const ParentLoop = Loop({
  create: (data, ctx) => {
    const child = ChildLoop.sync(null, data.child, ctx);
    return {
      sustain { child }
    };
  },
  update: (state, data, ctx) => {
    ChildLoop.sync(state.sustain.child, data.child, ctx);
    return state;
  },
  destroy: (state, ctx) => {
    ChildLoop.sync(state.sustain.child, null, ctx);
  },
});
```

This pattern is ideal for managing subtrees of state or imperative sidecar objects (like renderables, contexts, or network subscriptions).

---

## 🧾 Architecture

```
[action, payload] → reducers → transformers → Loop.sync()
                                            → effects
```

- All messages are `[action: string, payload: unknown]` signals
- Reducers return either new state or a Frame (`{ state, handled, effects }`)
- Transformers shape state before it reaches the Loop
- Effects are executed after reducer/transform passes complete

---

## 🧪 Example

```ts
const incrementReducer = (state, [action, payload]) => {
  if (action === "increment") {
    return { ...state, count: state.count + 1 };
  }
  return null;
};
incrementReducer.ACTIONS = ["increment"];

const AppLoop = Loop({
  create: ({ count }, ctx) => ({ echo: { count }, sustain: {} }),
  update: (prev, { count }, ctx) => ({ ...prev, echo: { count } }),
  destroy: () => {},
});

Score()
  .withReducers([incrementReducer])
  .withRootLoop(AppLoop)
  .withInitialState({ count: 0 })
  .start();
```

---

## 📦 Package Exports

```ts
import { Score, Loop } from "tenuto";
```

- `Score` — starts the orchestration and dispatch system
- `Loop` — defines declarative, retained logic units
- `Action`, `Signal`, `Reducer`, etc. — available as types

---

## 🪪 License

MIT © Kevin Gisi
