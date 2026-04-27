Viewed GoogleAIStudioAdapter.ts:66-92

The root cause is a classic **cross-realm `instanceof` bug** in JSDOM.

From the diffs you showed earlier, the bad commit changed:

```typescript
// WORKING (original)
if (root.nodeType === 3) return null;
const el = root as Element;
```
```typescript
// BROKEN (the "type fix" commit)
if (!(root instanceof Element)) return null;
const el = root;
```

### Why it broke

The code runs in Node.js with **two separate JSDOM instances**:

1. **`env.ts`** creates a JSDOM instance and sets `global.Element`, `global.Node`, etc.
2. **`tester.ts`** creates a **second, fresh JSDOM instance** to parse the HTML content.

The DOM nodes (all those `<semantics>`, `<mrow>`, `<annotation>` MathML elements) come from instance **#2**. But `instanceof Element` checks against the prototype from instance **#1** (the global one).

These are different objects. `instanceof` walks the prototype chain and can't cross JSDOM realm boundaries — so **every node** from the tester's JSDOM fails `instanceof Element`, returning `null` immediately without ever descending into the tree. `findSource` becomes a no-op. Shielding finds no LaTeX → the raw `<pre>` blocks survive → everything breaks.

### Why `nodeType === 3` works

`nodeType` is just a number property on the node object itself. It doesn't do any prototype chain comparison — it works correctly across JSDOM realms.

### The lesson

Any `instanceof HTMLElement` / `instanceof Element` check in code that touches DOM nodes from JSDOM in tests needs to use `nodeType` checks instead. Your TypeScript type cast (`root as Element`) was the correct, safe approach.
