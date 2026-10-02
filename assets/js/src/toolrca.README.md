# ToolRCA project page

The page is independently accessible at `/projects/toolrca/project/`. It must not be added to homepage navigation, News, Publications, search, or the sitemap. The paper remains unavailable until its release is authorized.

`_data/toolrca_project.json` is the shared source for server-rendered tables, interactive plots, model/configuration coverage, and the Section 5.1 case summary. Numeric array order is recorded in `overall_columns` and `model_columns`; each system occupies four columns in the order AC@1, AC@3, Avg@5, TA. All reported data comes from the supplied anonymous manuscript, Tables 3–5 and Figures 5/7. The nine one-level additions are computed from Table 5, not invented measurements.

Bundle `toolrca-project.js` with D3 7.9.0 and esbuild. Build dependencies stay outside the Jekyll repository; the resulting bundle and license notice are committed for offline runtime use.

```js
await esbuild.build({
  entryPoints: ['assets/js/src/toolrca-project.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'assets/js/toolrca-project.min.js',
  legalComments: 'linked',
  banner: {js: '/* D3 license: toolrca-project.LICENSE.txt */'}
});
```

Run `node --test tests/toolrca-data.test.mjs` for data, coverage, comparison, and case invariants. Browser checks must include no-JavaScript reading, reduced motion, chart switching, keyboard tabs, all six case frames, end-of-playback, offscreen/background pause, and desktop/mobile layout. ToolRCA CSS is confined to its body class and `.trca` root. The shared layout only loads this script for the ToolRCA theme.
