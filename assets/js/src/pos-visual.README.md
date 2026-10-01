# PoS visual bundle

`pos-visual.js` contains the editable Three.js case environments and progressive content reveals. The case controller in `pos-project.js` emits one `pos:frame` snapshot for the environment; the same snapshot updates the Cytoscape belief, captions, and timeline.

Build with Three.js 0.186.1 and esbuild, without adding dependencies to the Jekyll site:

```js
await esbuild.build({
  entryPoints: ["assets/js/src/pos-visual.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  supported: {"template-literal": false},
  outfile: "assets/js/pos-visual.min.js",
  legalComments: "linked"
});
```

The hero uses the static vector mark in `images/projects/pos/pos-mark.svg`. Its only motion is a one-time opacity fade in `_sass/_pos-editorial.scss`; reduced motion shows it immediately. It does not depend on JavaScript or WebGL. Case playback remains separately controlled and can be replayed.

Beyond Memory displays the supplied static figure with a responsive WebP source and a full-resolution link. Its only motion is an opacity reveal.

Build `pos-experience.js` to `assets/js/pos-experience.min.js` with the same esbuild settings (no Three.js dependency). Progression opens on a complete worked window. Playback is user initiated, suspends offscreen or in a background tab, and stops at the end. Progression and Recovery share task, active gap, pattern, and computed metrics through the `pos:progress-selection` event.

The worked task contains an early window with partial progress and a later stalled window. Recovery recomputes health after either an observation that leaves the gap open or an observation that resolves it. These calculations are mechanism examples, not measured episode curves.

`pos-metrics.js` implements the paper's window-level calculations for the worked examples. These are symbolic examples, not measured episode curves. The recorded case only shows reported health values. Run the calculation tests with `node --test tests/pos-metrics.test.mjs`.
