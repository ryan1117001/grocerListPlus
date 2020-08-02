import Fuse from 'fuse.js'
import { map } from 'lodash'

function itemName(result) {
    return result.item
}

function storeName(result) {
    return result.item
}

export function searchByItemName(data, value) {
    const options = {
        keys: ['itemName']
    }
    var fuse = new Fuse(data, options)
    const results = fuse.search(value)
    const mappedResults = map(results, itemName)
    return mappedResults
}

export function searchByStoreName(data, value) {
    const options = {
        keys: ['storeName']
    }
    var fuse = new Fuse(data, options)
    const results = fuse.search(value)
    const mappedResults = map(results, storeName)
    return mappedResults
}