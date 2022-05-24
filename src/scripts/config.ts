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
                        <img width="60" height="80" src="/img/logo.svg" alt="Astro logo">
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

export const sw = {
    cache: {
        prefix: `sw-${app.name}`,
        version: 2,
    },
    static: [
        '/',
        '/blank'
    ],
    dynamic: [
        '/about'
    ]
}

export const getMainTag = () => 'main'



