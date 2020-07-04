import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase('grocerListPlus.db')

// enable foriegn keys
export const enableFK = 'PRAGMA foreign_keys = ON;'

// create stores table
export const createStoresTable =  `
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
    isInventoried INTEGER,
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
export const insertItem = 'INSERT INTO items (itemName, isInventoried, storeId) values (?,0,?)'
export const deleteItems = 'DELETE FROM items;'
export const deleteItemsByStoreId = 'DELETE FROM items WHERE storeId = ?'
export const deleteItem = 'DELETE FROM items WHERE id=?;'
export const selectItems = 'SELECT * FROM items;'
export const selectUncheckedItems = 'SELECT * FROM items WHERE isInventoried=0 AND storeId=?'
export const selectCheckedItems = 'SELECT * FROM items WHERE isInventoried=1 AND storeId=?'
export const selectAllInventoriedItems = 'SELECT * FROM stores INNER JOIN items ON items.storeId = stores.id WHERE isInventoried = 1;'
export const selectAllUninventoriedItems = 'SELECT * FROM stores INNER JOIN items ON items.storeId = stores.id WHERE isInventoried = 0;'
// Checkbox status
export const changeToInventoried = 'UPDATE items SET isInventoried = 1 WHERE id = ?;'
export const changeToUninventoried = 'UPDATE items SET isInventoried = 0 WHERE id = ?;'

// Drop Tables
export const dropStoreTable = 'DROP TABLE stores;'
export const dropItemsTable = 'DROP TABLE items;'

export default function () {
	return
}