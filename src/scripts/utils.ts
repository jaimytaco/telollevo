interface IMProduct {
    id: string
    code: string
    slug: string
}

class MProduct implements IMProduct {
    id: string
    code: string
    slug: string
}

const publicAbout = async (lib) => {
    const products = await lib.database.getAll('products', 'online')
    return {
        head: {
            title: 'Te lo llevo | Inicio',
            meta: ''
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

export const models =   {
    products: MProduct
}

export const loaders = ['products']

export const ui = {
    'public-about': {
        pathname: '/about',
        builder: publicAbout,
        pattern: '/about{/}?'
    },
    // 'assets-js': {
    //     pattern: '/about{/}?',
    //     builder: () => fetch()
    // }
}

export const sw = {
    cache: {
        prefix: 'sw-telollevo',
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



