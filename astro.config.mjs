import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    build: {
        format: 'file'
    },
    vite: {
        build: {
            minify: false,
            rollupOptions: {
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name][extname]',
                },
            },
        },
        // worker: {
        //     rollupOptions: {
        //         output: {
        //             entryFileNames: '[name].js',
        //             chunkFileNames: '[name].js',
        //             assetFileNames: '[name].[extname]',
        //         },
        //     },
        // },
    },
})