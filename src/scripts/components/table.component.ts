import { getDOMElement } from '@helpers/util.helper'

interface IRow{
    id: string,
    tags: string[],
    heading: string,
    details: string[],
    icon: string,
    actions: T,
    extra: T
}

const renderRowTags = (tags: string[]) => {
    if (!tags.length) return ''
    return `
        <div class="card-2-group">
        ${
            tags.map((tag) => `<h6 class="card-2">${tag}</h6>`).join('')
        }
        </div>
    `
}

const renderRows = (rows: IRow[]) => {
    if (!rows.length) return '' // TODO: empty table
    return `
        ${
            rows.map((row) => `
                <div class="t-row">
                    <div class="t-r-details">
                        <div class="card-1">
                            <picture class="c-1-icon">
                                <img src="/img/icon/${row.icon}" width="40" height="40">
                            </picture>
                            <div class="c-1-detail">
                                ${renderRowTags(row.tags)}
                                <h6>${row.heading}</h6>
                                ${
                                    row.details.map((detail) => `
                                        <p>
                                            ${detail.icon ? 
                                                `
                                                <picture>
                                                    <img src="/img/icon/${detail.icon}" width="14" height="14">
                                                </picture>
                                                ` : ''
                                            }
                                            <span>${detail.description}</span>
                                        </p>
                                    `).join('')
                                }
                            </div>
                        </div>
                    </div>
                    <div class="t-r-actions t-r-actions-desktop">
                        <button class="btn btn-round btn-spin" data-show-table-extra_id="${row.id}">
                            <picture>
                                <img src="/img/telollevo/icon/chevron-down-sm.svg" width="14" height="14">
                            </picture>
                        </button>
                    </div>
                    <div class="t-r-actions t-r-actions-mobile">
                        <div class="split-btn">
                            <span class="sp-popup-trigger btn" tabindex="-1">
                                <picture>
                                    <img src="/img/icon/more-vertical.svg" width="14" height="14">
                                </picture>
                                <ul class="sp-popup">
                                    <li>
                                        <button class="btn" data-show-table-extra_id="${row.id}" data-show-table-extra_id-close="Ocultar pedido" data-show-table-extra_id-open="Ver pedido">Ver pedido</button>
                                    </li>  
                                </ul>
                            </span>
                        </div>
                    </div>
                    ${row.extra}
                </div>
            `).join('')
        }
        <div class="t-row t-r-last"></div>`
}

const render = (heading, rows, filters, sorters) => {
    return `
        <section class="s-table">
            <header>
                <h1>${heading}</h1>
                <div class="s-t-h-actions">
                    <div class="split-btn">
                        <span class="sp-popup-trigger btn btn-underline" tabindex="-1">
                            <picture>
                                <img src="/img/icon/filter.svg" width="16" height="16">
                            </picture>
                            <span>Filtrar por</span>
                            <ul class="sp-popup">
                                ${
                                    filters.map((filter) => `
                                        <li>
                                            <button class="btn">${filter}</button>
                                        </li>
                                    `).join('')
                                }
                            </ul>
                        </span>
                    </div>
                    <div class="split-btn">
                        <span class="sp-popup-trigger btn btn-underline" tabindex="-1">   
                            <picture>
                                <img src="/img/icon/sort.svg" width="16" height="16">
                            </picture>
                            <span>Ordenar por</span>
                            <ul class="sp-popup">
                                ${
                                    sorters.map((sorter) => `
                                        <li>
                                            <button class="btn">${sorter}</button>
                                        </li>
                                    `).join('')
                                }
                            </ul>
                        </span>     
                    </div>
                </div>
            </header>
            <div class="s-t-body">
                ${renderRows(rows)}
            </div>
        </section>
    `
}

const handleRowExtra = (id) => {
    const handleTableBtn = getDOMElement(document, `[data-show-table-extra_id="${id}"]`)
    handleTableBtn.onclick = () => {
        const extra = getDOMElement(document, `#${id}`)

        const btns = getDOMElement(document, `[data-show-table-extra_id="${id}"`, 'all')
        btns.forEach((btn) => {
            const content = btn.getAttribute(`data-show-table-extra_id-${extra.matches('.active') ? 'open' : 'close'}`)
            if (content) btn.textContent = content
            btn.classList.toggle('active')
        })

        extra.classList.toggle('active')
    }   
}

export default {
    render,
    handleRowExtra
}