# Figma Build Notes

Gotchas hit while building the design system. Recorded so the next build (or the next
person) does not rediscover them.

## `INSTANCE_SWAP` default value wants a node id, not a component key

The Figma reference documentation says the `defaultValue` for an `INSTANCE_SWAP`
component property is a component **key**. For local (unpublished) components it is not —
passing `component.key` throws:

```
in addComponentProperty: Property value is incompatible with component property type
```

Pass `component.id` instead. `TEXT` and `BOOLEAN` properties behave as documented.

```js
// Fails on a local component
set.addComponentProperty('icon', 'INSTANCE_SWAP', phoneComp.key);
// Works
set.addComponentProperty('icon', 'INSTANCE_SWAP', phoneComp.id);
```

An `INSTANCE_SWAP` property also requires the slot node to already be an `INSTANCE`.
A placeholder `FRAME` cannot carry a `mainComponent` reference — swap the placeholder for
a real instance first, then add and link the property.

## `figma.createAutoLayout()` inherits a white fill

Every layout container comes back with an opaque white fill. On a white page this is
invisible; on a dark one it paints a white block over everything. Set `fills = []`
explicitly on every structural container.

## `combineAsVariants` stacks all variants at (0,0)

Set `layoutMode = 'NONE'` on the resulting set and position children on an explicit grid.
Leaving the set in auto-layout produced a single 1788px-tall column. Axis labels belong on
the page *outside* the set — anything inside becomes variant content.

## Font style strings differ per family

`Archivo` → `SemiBold`. `Inter` → `Semi Bold`. Verify with
`figma.listAvailableFontsAsync()` before loading; never guess from memory. This is why the
weight tokens are split into `weight/display-*` and `weight/body-*`.

## Mode limits by plan

Starter 1, Professional 4, Org/Enterprise 40. The `student` tier accepted 3 modes
(Sanitär / Elektro / Garten). A fourth vertical would still fit; a fifth would not.

## Re-assigned paints keep a stale black fallback

`figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:0,g:0,b:0}}, 'color', v)`
works on a freshly created node, but when the same call *replaces* an existing paint the
resolved colour sometimes stays black even though `boundVariables.color` is correct. The
node renders as a black block.

Seed the paint with the token's resolved value instead of black:

```js
const paint = (name) => {
  const v = T(name);
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: resolve(v, modeId) },  // real colour, not {0,0,0}
    'color', v
  );
};
```

`resolve()` must follow `VARIABLE_ALIAS` chains down to a literal.

## Contrast must be audited per mode, not once

Four defects only existed in some modes, and none were visible by eye:

| Pair | Was | Fix |
|---|---|---|
| `text/muted` on page | 3.03:1 | `neutral/400` → `neutral/500` |
| `status/warning-fg` on its tint | 3.89:1 | `#B26A00` → `#8A5200` |
| `icon/brand` on page (**Elektro only**) | 2.73:1 | `elektro/500` → `elektro/600` |
| focus ring on CTA fill | 1.47–1.97:1 | ring drawn *outside* via `outline-offset`, plus new `color/focus/ring` + `ring-offset` |

The focus-ring one is the instructive case: a ring drawn on top of a saturated CTA can
never pass, in any theme. The fix is geometry, not colour — offset it onto the page
background, where it clears 3:1 everywhere.

Audit script lives in the conversation history; port it to CI as
`scripts/audit-contrast.ts` when `src/` exists.

## `resize()` silently reverts auto-layout sizing modes — set the hug AFTER

This one produced eight collapsed components and was invisible in screenshots, because a
10px-tall auto-layout frame does not clip its children — the content still renders, so the
page *looks* correct while every frame is actually 10px tall. It only surfaces once the
component is instanced inside another auto-layout, where the parent honours the real
height.

```js
// BROKEN — resize() resets primaryAxisSizingMode back to FIXED
card.layoutMode = 'VERTICAL';
card.primaryAxisSizingMode = 'AUTO';   // height hugs
card.resize(360, 10);                  // ← silently reverts the line above

// CORRECT — resize first, append children, then set the hug last
card.layoutMode = 'VERTICAL';
card.resize(360, 10);
// ... appendChild all children ...
card.primaryAxisSizingMode = 'AUTO';   // now it sticks
```

Setting `layoutMode` *after* `resize()` has the same effect on the cross axis — it
recomputed the reference image slots down to 46px.

**Verify heights numerically, never by eye:**

```js
page.findAll(n => n.layoutMode === 'VERTICAL' && n.height < 20)
    .map(n => ({ name: n.name, h: n.height }));
```

Affected and fixed: `Card/Service` (10→315), `Card/Stat` (10→118), `Card/Review` (10→171),
all 12 `Input` variants (10→103), both `FAQ Item` variants (10→72/147),
`Cookie Banner` (10→246), `Cookie Settings` (10→492).

## Axis sizing modes are named by layout direction, not by screen axis

On a **VERTICAL** auto-layout, `primaryAxisSizingMode` is **height** and
`counterAxisSizingMode` is **width**. On a **HORIZONTAL** one they swap. Copying a
sizing pair from a horizontal container into a vertical one collapses every section — it
sets height FIXED and width HUG, the exact opposite of the intent.

## Component TEXT properties override direct `characters` writes

When retheming a cloned screen, replacing text by walking `findAll(TEXT)` and assigning
`characters` works for plain text nodes but is **silently ignored** on any text node bound
to a component TEXT property. The write appears to succeed — no error — and the old value
stays on screen.

Three things were still showing Sanitär copy after a "successful" 24-replacement pass:
the Notdienst banner message, all nine service-card fields, and the button labels.

Set the property instead:

```js
for (const inst of frame.findAll(n => n.type === 'INSTANCE' && !n.id.includes(';'))) {
  const props = inst.componentProperties;
  const next = {};
  for (const [key, def] of Object.entries(props)) {
    if (def.type === 'TEXT' && map[def.value]) next[key] = map[def.value];
  }
  if (Object.keys(next).length) inst.setProperties(next);
}
```

**A nested instance id contains `;`** (e.g. `I43:483;14:140`) — that is an icon inside a
button, not a button. Reading `.mainComponent` on one throws
`The node with id ... does not exist` and aborts the whole script. Always filter them out.

## Figma rolls the whole script back on an uncaught error

The failed Garten clone left *nothing* behind — the frame did not exist on the retry
check. Useful: a partially-applied script is not the usual failure mode, so a clean retry
is normally safe. Still read the canvas first, per the error-recovery rule; "normally" is
not "always".

## A freshly cloned frame does not expose its instances' subtrees yet

The single most expensive bug of the screen-building pass, and it fails **silently**.

```js
const f = src.clone();
const texts = f.findAllWithCriteria({ types: ['TEXT'] });   // misses everything inside instances
for (const t of texts) if (map[t.characters]) t.characters = map[t.characters];
```

On the Elektro Leistung clone this replaced **12 of 23** strings. The twelve were plain
text in plain frames; the eleven misses were all inside `Nav/Desktop` and
`Footer / Desktop` instances. No error, and the returned count of 12 looked plausible
enough to move on. The nav still said "Sanitär Muster" on an Elektro page.

Writing `characters` on those nodes works perfectly — a later probe confirmed it. They
were simply **not in the array**, because the cloned instances' children had not
materialised at the moment `findAll` ran.

Two fixes, either works:

```js
// A — force each instance subtree to materialise first
for (const i of f.findAll(n => n.type === 'INSTANCE')) i.findAll(n => n.type === 'TEXT');
const texts = f.findAll(n => n.type === 'TEXT');   // now complete

// B — do the instance pass in a second use_figma call
```

Fix A took the same clone from 12 replacements to 33.

**Always end a retheme with an assertion, not a count:**

```js
return { remaining: f.findAll(n => n.type === 'TEXT' &&
  /Sanitär|suissetec|Rohrreinig/.test(n.characters)).map(n => n.characters) };
// must be []
```

A replacement count tells you what you changed. Only a scan for the old brand tells you
what you missed.

## `createImageAsync` and `loadAllPagesAsync` are not available

`figma.createImageAsync(url)` — "not a supported API". Images must come through
`upload_assets` → POST the returned `submitUrl`. `figma.loadAllPagesAsync()` is likewise
unavailable; load pages individually with `getNodeByIdAsync(pageId)`, which does not
count as a page switch and can therefore be done many times in one script.

## An image hash created but never attached is garbage-collected

`figma.createImage(bytes)` in one script and using `img.hash` in a *later* script yields a
node with an image fill and no image. The agency page's three demo screenshots rendered
as empty grey boxes twice before this was clear. Create and attach in the same script.

Related: a fill attached in the current script does not appear in that same script's
`node.screenshot()` — the bytes have not reached the render service yet. Verify with a
separate `get_screenshot` call, not inline.

## `upload_assets` returns one URL per call in this transport

The `count` parameter arrives as a string and is rejected. Issue N parallel `upload_assets`
calls in one message to get N URLs, then POST all files in one shell command.

## Contrast: split the token, do not darken the shared one

`color/border/default` at 1.31:1 was drawing both dividers *and* input-field boundaries.
Only the second is a WCAG 1.4.11 failure — decorative rules are explicitly exempt. The fix
is a new `color/border/control` at 3.03:1 bound to inputs, pagination and the unselected
wizard dot; dividers keep the subtle value. Darkening `border/default` to pass the audit
would have made every card and table rule look heavy for no accessibility gain.

Same shape of fix for `color/icon/on-brand` (white on Elektro amber is 2:1) — mode-aware,
mirroring the existing `color/cta/fg`.

## The Ghost button variant is invalid on brand, emergency and inverse backgrounds

Transparent fill plus brand-coloured label. On `color/bg/brand` the label is brand-on-brand
and effectively disappears. Caught on the Leistungen CTA band. On a coloured band use
`Secondary` (white fill) plus, if a second action is needed, a plain inverse text link.
