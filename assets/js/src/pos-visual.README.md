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
