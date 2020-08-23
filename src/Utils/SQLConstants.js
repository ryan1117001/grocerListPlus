import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase('grocerListPlus.db')

// enable foriegn keys
export const enableFK = 'PRAGMA foreign_keys = ON;'

export const createSettingsTable = `
CREATE TABLE IF NOT EXISTS settings (
    settingId INTEGER PRIMARY KEY,
    isInitiated INTEGER DEFAULT 0
);`

// create stores table
export const createStoresTable = `
CREATE TABLE IF NOT EXISTS stores ( 
    storeId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    storeName TEXT,
    storeArchiveDate DATETIME,
    dateToGo DATETIME,
    storeType TEXT
);`

// create units table
export const createUnitsTables = `
CREATE TABLE IF NOT EXISTS units (
    unitId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    unitName Text
);`

// create items table
export const createItemsTable = `
CREATE TABLE IF NOT EXISTS items (
    itemId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    itemName TEXT,
    itemType TEXT,
    amountOfUnit TEXT,
    priceAmount TEXT,
    storeId INTEGER NOT NULL,
    categoryId INTEGER,
    unitId INTEGER,
    itemArchiveDate DATETIME,
    purchaseDate DATETIME,
    expirationDate DATETIME,
    quantity INTEGER,
    FOREIGN KEY (unitId)
        REFERENCES units(unitId),
    FOREIGN KEY (categoryId)
        REFERENCES categories(categoryId),
    FOREIGN KEY (storeId)
        REFERENCES stores(storeId)
);`

// create categories table
export const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS categories (
    categoryId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    category TEXT,
    isDefault INTEGER
);`

// Drop Tables
export const dropStoreTable = 'DROP TABLE stores;'
export const dropItemsTable = 'DROP TABLE items;'
export const dropCategoriesTable = 'DROP TABLE categories;'
export const dropSettingsTable = 'DROP Table settings;'
export const dropUnitsTable = 'DROP TABLE units;'

// Settings
export const insertInitSetting = 'INSERT INTO settings (settingId, isInitiated) values (?,?);'
export const retrieveSettings = 'SELECT * FROM settings'

// Units
export const retrieveUnits = 'SELECT * FROM units;'

// Categories
export const retrieveCategories = 'SELECT * FROM categories;'

// Stores
export const insertStore = 'INSERT INTO stores (storeName, dateToGo,  storeArchiveDate, storeType) values (?,?,?,?);'
export const deleteStores = 'DELETE FROM stores;'
export const deleteStore = 'DELETE FROM stores WHERE storeId=?;'
export const selectAllStores = 'SELECT * FROM stores;'
export const selectStoresByStoreType = 'SELECT * FROM stores WHERE storeType=?;'
export const selectStore = 'SELECT * FROM stores WHERE storeId=?;'
export const updateDateToGo = 'UPDATE stores SET dateToGo=? WHERE storeId = ?;'
export const updateStoreArchiveDate = 'UPDATE stores SET storeArchiveDate=? WHERE storeId = ?;'
export const updateStoreName = 'UPDATE Stores SET storeName=? WHERE storeId = ?;'
export const updateStoreType = 'UPDATE Stores SET storeType=? WHERE storeId = ?;'

// Items
export const deleteItems = 'DELETE FROM items;'
export const deleteItemsByStoreId = 'DELETE FROM items WHERE storeId = ?;'
export const deleteItem = 'DELETE FROM items WHERE itemId=?;'
export const selectItems = 'SELECT * FROM items;'
export const insertStoreItem = `
    INSERT INTO items 
        (itemName, itemType, storeId, 
        categoryId, unitId, expirationDate, 
        quantity, amountOfUnit, priceAmount, 
        purchaseDate, itemArchiveDate) 
        values 
        (?,?,?,?,?,?,?,?,?,?,?);`
export const updateItemAttributes = 'UPDATE items SET itemName=?, categoryId=?, unitId=?, expirationDate=?, quantity=?, amountOfUnit=?, priceAmount=?, purchaseDate=?, itemArchiveDate=? WHERE itemId=?;'
export const insertInventoryItem = 'INSERT INTO items (itemName, itemType, storeId, purchaseDate) values (?,?,?,?);'
export const updateItemType = 'UPDATE items SET itemType=? WHERE itemId=?;'
export const updateItemPurchaseDate = 'UPDATE items SET purchaseDate=? WHERE itemId=?;'
export const updateItemArchiveDate = 'UPDATE items SET itemArchiveDate=? WHERE itemId=?;'
export const updateItemsOnUpdateStoreType = 'UPDATE items SET itemType=? WHERE storeId=? AND itemType=?;'

// Items Join Stores
export const selectItemsByItemTypeAndStoreId = `
    SELECT * FROM items
        JOIN stores ON 
            items.storeId = stores.storeId 
        JOIN categories ON
            items.categoryId = categories.categoryId
        JOIN units ON
            items.unitId = units.unitId
    WHERE itemType=? AND items.storeId=?;
`
export const selectAllItemJoinedStoresByItemType = `
    SELECT * FROM items 
        JOIN stores ON 
            items.storeId = stores.storeId 
        JOIN categories ON
            items.categoryId = categories.categoryId
        JOIN units ON
            items.unitId = units.unitId
    WHERE itemType = ?;
`

// Default Units
export const insertDefaultUnits = `
    INSERT INTO units (unitName) values
    ("n/a"),
    ("lbs"),
    ("oz."),
    ("gallons"),
    ("cups"),
    ("pints"),
    ("fl. oz."),
    ("kg"),
    ("g"),
    ("mg"),
    ("L"),
    ("mL")
`

// Default Categories
export const insertDefaultCategories = `
    INSERT INTO categories (category, isDefault) values
    ("Uncategorized", 1),
    ("Baked Goods", 1),
    ("Canned Goods", 1),
    ("Diary", 1),
    ("Frozen Goods", 1),    
    ("Meat", 1),
    ("Packaged Goods", 1),
    ("Pantry Goods", 1),
    ("Produce", 1)
`