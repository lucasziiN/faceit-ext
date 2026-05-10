// Build script — bundles each entry point into dist/. Chrome can't
// load TypeScript directly and the content script / service worker /
// side panel each need their own bundle, so esbuild produces one JS
// file per entry. CSS files go through esbuild too so we get one
// processed file per stylesheet in dist/.

import * as esbuild from 'esbuild'
import dotenv from 'dotenv'

// Loads FACEIT_API_KEY from .env into process.env so the `define`
// block below can inline it. The .env file is gitignored — secrets
// don't go in source control.
dotenv.config()

await esbuild.build({
    entryPoints: [
        'src/content.ts',
        'src/service_worker.ts',
        'src/content.css',
        'src/sidepanel.ts',
        'src/sidepanel.css'
    ],
    bundle: true,
    outdir: 'dist',
    platform: 'browser',
    define: {
        // Replace every `process.env.FACEIT_API_KEY` reference in the
        // source with the literal key value at build time. JSON.stringify
        // wraps it in quotes so it's a valid string literal in the output.
        'process.env.FACEIT_API_KEY': JSON.stringify(process.env.FACEIT_API_KEY)
    }
})
