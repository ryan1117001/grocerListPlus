import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase('grocerListPlus.db')

// enable foriegn keys
export const enableFK = 'PRAGMA foreign_keys = ON;'

// create stores table
export const createStoresTable = `
CREATE TABLE IF NOT EXISTS stores ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    storeName TEXT,
    dateToGo DATETIME
);`

// create items table
export const createItemsTable = `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    itemName TEXT,
    itemType TEXT,
    storeId INTEGER NOT NULL,
    FOREIGN KEY (storeId)
        REFERENCES stores(id)
);`

// Stores
export const insertStore = 'INSERT INTO stores (storeName, dateToGo) values (?,?);'
export const deleteStores = 'DELETE FROM stores;'
export const deleteStore = 'DELETE FROM stores WHERE id=?'
export const selectStores = 'SELECT * FROM stores;'
export const updateDateToGo = 'UPDATE stores SET dateToGo=? WHERE id = ?'

// Items
export const deleteItems = 'DELETE FROM items;'
export const deleteItemsByStoreId = 'DELETE FROM items WHERE storeId = ?'
export const deleteItem = 'DELETE FROM items WHERE id=?;'
export const selectItems = 'SELECT * FROM items;'
export const insertItem = 'INSERT INTO items (itemName, itemType, storeId) values (?,?,?)'
export const selectItemsByItemTypeAndStoreId = 'SELECT * FROM items WHERE itemType=? AND storeId=?'
export const changeItemType = 'UPDATE items SET itemType = ? WHERE id = ?;'

// Items Join Stores
export const selectAllItemJoinedStoresByItemType = `
	SELECT * FROM stores INNER JOIN items 
		ON items.storeId = stores.id 
		WHERE itemType = ?;`

// Drop Tables
export const dropStoreTable = 'DROP TABLE stores;'
export const dropItemsTable = 'DROP TABLE items;'

export default function () {
	return
}