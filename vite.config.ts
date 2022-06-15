import { defineConfig } from 'vite'
import eslint from '@rollup/plugin-eslint'

const assetsDir = '.'

const publicPaths = {
    main: new URL('./index.html', import.meta.url).pathname,
    blank: new URL('./blank.html', import.meta.url).pathname,
    traveler: new URL('./traveler.html', import.meta.url).pathname,
    shopper: new URL('./shopper.html', import.meta.url).pathname,
}

const adminPaths = {
    orders: new URL('./admin-orders.html', import.meta.url).pathname,
    newOrders: new URL('./admin-orders.html', import.meta.url).pathname
}

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
                ...publicPaths,
                ...adminPaths
            },
            // output: {
            //     entryFileNames: `[name].js`,
            //     chunkFileNames: `[name].js`,
            //     assetFileNames: `[name].[ext]`
            // }
        },
    },
})