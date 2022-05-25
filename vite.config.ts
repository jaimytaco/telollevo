import { defineConfig } from 'vite'
import eslint from '@rollup/plugin-eslint'

const assetsDir = '.'

export default defineConfig({
    plugins: [
        {
            ...eslint({
                include: 'src/**/*.+(js|jsx|ts|tsx)'
            }),
            enforce: 'pre'
        }
    ],
    build: {
        assetsDir,
        minify: false,
        rollupOptions: {
            input: {
                main: new URL('./index.html', import.meta.url).pathname,
                blank: new URL('./blank.html', import.meta.url).pathname,
                traveler: new URL('./traveler.html', import.meta.url).pathname,
            },
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`
            }
        },
    },
})