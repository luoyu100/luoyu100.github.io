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

State perception uses `pos-perception.js` for the execution scene and the `pos:perception` snapshot emitted by `pos-experience.js`. The same snapshot updates the history, current facts, provenance, and gap. Diagnosis has a semantic HTML scene that also works without WebGL.

Build `pos-experience.js` to `assets/js/pos-experience.min.js` with the same esbuild settings (no Three.js dependency). Its demonstrations run once on first visibility, suspend offscreen or in a background tab, and allow explicit replay. Reduced motion disables automatic playback.

`pos-metrics.js` implements the paper's window-level calculations for the worked examples. These are symbolic examples, not measured episode curves. The recorded case only shows reported health values. Run the calculation tests with `node --test tests/pos-metrics.test.mjs`.
