const publicAbout = async (wf) => {
    const products = await wf.database.getAll(wf.mode.Offline, 'products')

    return {
        head: {
            title: 'Te lo llevo | Inicio',
            meta: `
                <meta name="description" content="DESCRIPTION">
                <meta property="og:url" content="OG_URL">
                <meta property="og:type" content="OG_TYPE">
            `
        },
        body: `
            <main>
                <h1>About</h1>
                <header>
                    <div>
                        <img width="60" height="80" src="/img/telollevo/logo.svg" alt="Astro logo">
                        ${products
                .map(product => `<h1>Welcome to <a href="/category/${product.name}">${product.name}</a></h1>`)
                .join('')
            }
                    </div>
                </header>
            </main>
        `
    }
}

const productDetailGenerator = async (wf) => {
    const products = await wf.database.getAll(wf.mode.Offline, 'products')

    return products
        .map((product) => ({
            head: {
                title: `Producto | ${product.name}`,
                meta: ''
            },
            body: `
                <main>
                    <header>
                        <h1>${product.name}</h1>
                    </header>
                </main>
            `
        }))
}

export const app = {
    name: 'telollevo'
}

export const models = {
    products: {}
}

export const loaders = ['products']

export const ui = {
    'public-about': {
        pathname: '/about',
        builder: publicAbout,
        pattern: '/about{/}?'
    },
}

export const generator = {
    'gen-product': {
        pathname: '/product',
        builder: productDetailGenerator,
        pattern: '/products/:slug{/}'
    }
}

const fonts = [
    '/fonts/isidora-sans/IsidoraSans-Bold.ttf',
    '/fonts/isidora-sans/IsidoraSans-Regular.ttf',
    '/fonts/isidora-sans/IsidoraSans-SemiBold.ttf',
]

const images = [
    '/img/telollevo/icon/avatar.svg',
    '/img/telollevo/icon/chevron-down.svg',
    '/img/telollevo/icon/clock.svg',
    '/img/telollevo/icon/lock.svg',
    '/img/telollevo/icon/luggage.svg',
    '/img/telollevo/icon/money.svg',
    '/img/telollevo/icon/pig.svg',
    '/img/telollevo/icon/spark-1.svg',
    '/img/telollevo/icon/spark-2.svg',
    '/img/telollevo/icon/city.jpg',
    '/img/telollevo/thumbnail/what-can-you-bring-1.jpg',
    '/img/telollevo/thumbnail/what-can-you-bring-2.jpg',
    '/img/telollevo/thumbnail/what-can-you-bring-3.jpg',
]

const scripts = [
    '/browser.helper.js',
    '/main2.js',
    '/modulepreload-polyfill.js',
    '/pwa.actor.js',
    '/database.worker.66931918.js',
]

const styles = [
    '/main.css',
]

const routes = [
    '/',
    '/blank',
    '/traveler',
    '/shopper',
]

export const sw = {
    cache: {
        prefix: `sw-${app.name}`,
        version: 2,
    },
    static: [
        ...fonts,
        ...images,
        ...scripts,
        ...styles,
        ...routes,
    ],
    dynamic: [
        // '/about'
    ]
}

export const getMainTag = () => 'main'