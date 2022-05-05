import { defineConfig } from 'vite'
import eslint from '@rollup/plugin-eslint'

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
        assetsDir: '.',
    },
})