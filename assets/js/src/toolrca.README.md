# ToolRCA project page

The page is independently accessible at `/projects/toolrca/project/`. It must not be added to homepage navigation, News, Publications, search, or the sitemap. The paper remains unavailable until its release is authorized.

`_data/toolrca_project.json` is the shared source for server-rendered tables, interactive plots, model/configuration coverage, and the Section 5.1 case summary. Numeric array order is recorded in `overall_columns` and `model_columns`; each system occupies four columns in the order AC@1, AC@3, Avg@5, TA. All reported data comes from the supplied anonymous manuscript, Tables 3–5 and Figures 5/7. The nine one-level additions are computed from Table 5, not invented measurements.

Section 04 uses two native single-choice radio groups styled as direct-click configuration options. Each group exposes all eight configurations, updates the comparison immediately, and supports standard arrow-key selection. Preserve the L3 / L1+L2+L3 defaults and the blue / teal chart mapping.

Readers see the research gap and contribution before the full abstract, and each results section has a fixed finding, representative comparison, and scope before its interactive controls. These summaries remain readable without JavaScript; displayed accuracy changes and token ratios are derived from the same table data. The full abstract, protocol notes, and original figures remain available in disclosure panels.

`_includes/toolrca-spectrum.html` is the Section 02 overview, drawn with native inline SVG and responsive HTML labels. The four analytical motifs and their text remain independently editable. Concise descriptions live in each level's `diagram` object in the shared JSON data. The visuals are schematic, not additional experimental data; the four lanes are alternatives, not a required L1-to-L3 pipeline. On mobile the tool illustration spans the row and its returned result and remaining agent work sit below it, without shrinking the labels into a raster image. The previous generated bitmap is retained as an unused draft, not requested by the page.

`spectrum_example` contains explicitly illustrative interface outputs, not benchmark measurements. `reporting` distinguishes stated protocol details from missing Python environment/access, repeat-count, uncertainty, and conditional-sample-count information. Do not fill these gaps by inferring them from rounded results.

The case separates available observations, summarized agent interpretation, and reader-side reasoning checks. Its benchmark label is revealed only in the final frame; early frames must not identify a recommendation as correct using hindsight. The checks are explanations of the summarized case, not fabricated quotes or raw API traces. Each guideline has a `when`, `check`, and `try`, with an internal evidence link; proposed actions are not claimed as separately validated improvements.

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
