import { logger } from '@wf/helpers/browser.helper'

export const hasParameter = (o, key) => !!o && Object.keys(o).includes(key)

export const isValidDate = (d) => d.toString() !== 'Invalid Date'

export const isValidString = (s) => s && typeof s === 'string' && s.length > 0

export const isBoolean = (b) => typeof b === 'boolean'

// Taken from https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
export const isNumeric = (num) => (typeof(num) === 'number' || typeof(num) === 'string' && num.trim() !== '') && !isNaN(num as number)

// Taken from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export const isValidHttpUrl = (string) => {
    let url

    try {
        url = new URL(string)
    } catch (_) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
}

export const formatLocaleDate = (date) => date.toLocaleDateString ? date.toLocaleDateString('es-PE') : date

export const capitalizeString = (str) => {
    if (!str) return ''
    const [first, ...rest] = str
    return first || rest ? `${first.toUpperCase()}${rest.join('')}` : ''
}

export const getBodyPage = () => document.body.getAttribute('data-page')

export const getDOMElement = (parent, query, mode: 'all' | undefined) => { 
    const el = parent[`querySelector${mode ? 'All' : ''}`](query)
    // if (!el) throw `'${query}' query not found in '${parent.id || parent.className}' parent element` 
    if (!el){
        logger(`'${query}' query not found in '${parent.id || parent.className}' parent element`)
        return
    }

    return mode ? [...el] : el
}

export const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))



export const configApproveFlight = async (wf) => {
    const visibleFlightBtns = getDOMElement(document, '[data-visible-flight_btn]', 'all')
    visibleFlightBtns?.forEach((visibleFlightBtn) => visibleFlightBtn.onclick = async () => {
        // TODO: visible flight logic
        const { EFlightStatus } = await import('@types/flight.type')
        const id = visibleFlightBtn.getAttribute('data-visible-flight_btn')
        const { data: flight, err } = await wf.database.get(wf.mode.Network, 'flights', id)
        if (err) return

        // TODO: check if flight has quotations
        flight.status = flight.status === EFlightStatus.Registered ? EFlightStatus.Visible : EFlightStatus.Registered
        await wf.database.update(wf.mode.Network, 'flights', flight)

        // TODO: reload
        location.reload() 
    })
}