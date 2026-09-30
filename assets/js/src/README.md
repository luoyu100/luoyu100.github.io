# GoS Visual

`gos-visual.js` is the editable source for the particle graph, scroll chapters,
section reveals, and method cycle. The page loads `../gos-visual.min.js`, which
bundles Three.js 0.186.1 locally so no third-party CDN is required.

Rebuild from the repository root without changing the site's dependencies:

```sh
BUILD_DIR="$(mktemp -d)"
npm install --prefix "$BUILD_DIR" --no-audit --no-fund three@0.186.1 esbuild
NODE_PATH="$BUILD_DIR/node_modules" "$BUILD_DIR/node_modules/.bin/esbuild" assets/js/src/gos-visual.js --bundle --minify --format=iife --target=es2020 --supported:template-literal=false --legal-comments=linked --outfile=assets/js/gos-visual.min.js
```

Visual styles are in `_sass/_gos-visual.scss`. The complete interactive case
remains in `assets/js/gos-case.js`, with its snapshots in `_data/gos_case.yml`.
Three.js is distributed under the MIT license in `../lib/three-LICENSE.txt`.
