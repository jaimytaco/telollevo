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

export const getConfig = (OnlineDB, LocalDB, pwaActor) => ({
    models: {
        products: MProduct
    },
    loaders: ['products'],
    services: {
        OnlineDB,
        LocalDB
    },
    sw: {
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
        ],
        actor: pwaActor
    },
    ui: {
        'public-about': {
            pathname: '/about',
            builder: publicAbout,
            pattern: '/about{/}?'
        }
    }
})

export const isDynamicPathname = async () => {
    const { sw } = await getConfig()
    const keys = Object.keys(sw.ui)

    for (const key of keys){
        const { pathname, pattern } = sw.ui[key]
        const urlPattern = new URLPattern({ pathname })
        return location.pathname === pathname || urlPattern.test(location.pathname)
    } 

    return false
}

const publicAbout = async (lib) => {
    const products = await lib.database.getAll('products', 'local')
    return {
        head: {
            title: 'Te lo llevo | Inicio',
            meta: ''
        },
        body: `
            <main>
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