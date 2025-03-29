# 🎼 Sonatina

**Sonatina** is a small library for composing declarative state and imperative behaviors.  
It helps you reconcile updates to a state tree with side effects or mutations - cleanly and predictably.

---

## ✨ Currently included

### `Phrase`

A `Phrase` encapsulates stateful logic that evolves over time.  
It supports declarative reconciliation via `play()`:

```ts
import { Phrase } from "sonatina";

const Counter = Phrase({
  create(data, ctx) {
    return { count: data.initial };
  },
  update(state, data, ctx) {
    state.count += data.delta;
    return state;
  },
  destroy(state, ctx) {
    console.log("goodbye!");
  },
});

let counter;

// Create
counter = Counter.play(counter, { initial: 0 }, {});
// Update
counter = Counter.play(counter, { delta: 1 }, {});
// Destroy
counter = Counter.play(counter, null, {});
```

- If `counter` is `undefined` or `null`, `create()` is called
- If `data` is `null`, `destroy()` is called and the phrase returns `null`
- Otherwise, `update()` is called with the current state and next data

This makes `Phrase` ideal for managing lifecycle-bound logic, like animations, renderables, subscriptions, etc.

---

## 📦 Install

```bash
pnpm add sonatina
# or
npm install sonatina
# or
yarn add sonatina
```

---

## 🛣️ Roadmap

This is an early release focused on `Phrase`.  
The runtime (`Score`) and plugin system are coming soon in future minor versions.

---

## 📜 License

MIT © Kevin Gisi
