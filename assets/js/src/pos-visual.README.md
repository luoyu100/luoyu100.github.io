# PoS visual bundle

`pos-visual.js` contains the editable Three.js hero and case environments. The case controller in `pos-project.js` emits one `pos:frame` snapshot for the environment; the same snapshot updates the Cytoscape belief, captions, and timeline.

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

The hero has one document-lifetime clock. Hidden time is excluded; offscreen time is not. A finished scene never restarts on resize or scroll. Reduced motion and WebGL fallback show the final state. Case playback is separately controlled and can be replayed.
