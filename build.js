import * as esbuild from 'esbuild'
import dotenv from 'dotenv'
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
        'process.env.FACEIT_API_KEY': JSON.stringify(process.env.FACEIT_API_KEY)
    }
})
