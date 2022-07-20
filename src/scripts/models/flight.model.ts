import { IFlight } from '@types/flight.type'

const toRow = (flight: IFlight) => {
    return {
        id: flight.id,
        tags: [capitalizeString(flight.status)],
        heading: `${flight.code} - ${flight.airline}`,
        details: [{
            // description: order.product.category
        }],
        icon: 'flight.svg',
        actions: {},
        extra: '',
    }
}

export default{
    collection: 'flights',
    toRow
}