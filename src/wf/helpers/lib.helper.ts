import {
    isNode,
    supportsWorkerType,
} from '../helpers/browser.helper'

import { proxy } from 'comlink'

export const formatFn = (fn) => {
    if (isNode()) return fn
    if (supportsWorkerType()) proxy(fn)
    return fn
}