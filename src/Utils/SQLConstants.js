import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase('grocerListPlus.db')

// enable foriegn keys
export const enableFK = 'PRAGMA foreign_keys = ON;'

// create stores table
export const createStoresTable = `
CREATE TABLE IF NOT EXISTS stores ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    storeName TEXT,
    dateToGo DATETIME,
    archiveDate DATETIME,
    storeType TEXT
);`

// create items table
export const createItemsTable = `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    itemName TEXT,
    itemType TEXT,
    storeId INTEGER NOT NULL,
    purchaseDate DATETIME,
    archiveDate DATETIME,
    FOREIGN KEY (storeId)
        REFERENCES stores(id)
);`

// Stores
export const insertStore = 'INSERT INTO stores (storeName, dateToGo, storeType) values (?,?,?);'
export const deleteStores = 'DELETE FROM stores;'
export const deleteStore = 'DELETE FROM stores WHERE id=?;'
export const selectAllStores = 'SELECT * FROM stores;'
export const selectStoresByStoreType = 'SELECT * FROM stores WHERE storeType=?;'
export const selectStore = 'SELECT * FROM stores WHERE id=?;'
export const updateDateToGo = 'UPDATE stores SET dateToGo=? WHERE id = ?;'
export const updateStoreArchiveDate = 'UPDATE stores SET archiveDate=? WHERE id = ?;'
export const updateStoreName = 'UPDATE Stores SET storeName=? WHERE id = ?;'
export const updateStoreType = 'UPDATE Stores SET storeType=? WHERE id = ?;'

// Items
export const deleteItems = 'DELETE FROM items;'
export const deleteItemsByStoreId = 'DELETE FROM items WHERE storeId = ?;'
export const deleteItem = 'DELETE FROM items WHERE id=?;'
export const selectItems = 'SELECT * FROM items;'
export const insertStoreItem = 'INSERT INTO items (itemName, itemType, storeId) values (?,?,?);'
export const insertInventoryItem = 'INSERT INTO items (itemName, itemType, storeId, purchaseDate) values (?,?,?,?);'
export const selectItemsByItemTypeAndStoreId = 'SELECT * FROM items WHERE itemType=? AND storeId=?;'
export const updateItemType = 'UPDATE items SET itemType=? WHERE id=?;'
export const updateItemPurchaseDate = 'UPDATE items SET purchaseDate=? WHERE id=?;'
export const updateItemArchiveDate = 'UPDATE items SET archiveDate=? WHERE id=?;'
export const updateItemsOnUpdateStoreType = 'UPDATE items SET itemType=? WHERE storeId=? AND itemType=?;'

// Items Join Stores
export const selectAllItemJoinedStoresByItemType = `
	SELECT * FROM stores INNER JOIN items 
		ON items.storeId = stores.id 
		WHERE itemType = ?;`

// Drop Tables
export const dropStoreTable = 'DROP TABLE stores;'
export const dropItemsTable = 'DROP TABLE items;'