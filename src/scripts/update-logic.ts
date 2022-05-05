btn.onclick = async (e) => {
    const id = btn.getAttribute('data-product-id')
    const product = await Product.getById(id, 'local')

    if (isLocalOnly(product)){
        // do whaterver you want. if it is necessary stop everything (online-only)
    }

    await Product.update(product, 'local')
    renderProduct(product)

    const { err } = await Product.update(product, 'online') // internally it should not consider id nor _status
    if (err){
        // background-sync?
        const reg = await navigator.serviceWorker.ready
        reg.sync.register(`sync-product-update-${product.id}`)
        return
    }

    const { _status, ...data } = product 
    await Product.update(data, 'local')

    removeLocalTag(product.id)
}

const renderPage = async () => {
    const products = await Product.getAll('local') // [..., {..., _status: 'local-only'}]
    products.forEach(p => renderProduct(p)) // one with 'Pending...' tag
}

// sw.js
self.addEventListener('sync', (e) => {
    if (e.tag.contains('sync-product-update-')){
        e.waitUntil(() => {
            return new Promise(async (resolve, reject) => {
                const id = e.tag.split('sync-product-update-')[1]
                const product = await Product.getById(id, 'local')
                if (!isLocalOnly(product)) resolve()
                
                const { err } = await Product.update(product, 'online')
                if (err) reject()
                else resolve()
            })
        })
    }
})