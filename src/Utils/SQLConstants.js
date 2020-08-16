import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabase('grocerListPlus.db')

// enable foriegn keys
export const enableFK = 'PRAGMA foreign_keys = ON;'

export const createSettingsTable = `
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    isInitiated INTEGER DEFAULT 0
);`

// create stores table
export const createStoresTable = `
CREATE TABLE IF NOT EXISTS stores ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    storeName TEXT,
    archiveDate DATETIME,
    dateToGo DATETIME,
    storeType TEXT
);`

// create units table
export const createUnitsTables = `
CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    unitName Text
);`

// create items table
export const createItemsTable = `
CREATE TABLE IF NOT EXISTS items (
    itemId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    itemName TEXT,
    itemType TEXT,
    amountOfUnit REAL,
    priceAmount REAL,
    storeId INTEGER NOT NULL,
    categoryId INTEGER,
    unitId INTEGER,
    archiveDate DATETIME,
    purchaseDate DATETIME,
    expirationDate DATETIME,
    quantity INTEGER,
    FOREIGN KEY (unitId)
        REFERENCES units(id),
    FOREIGN KEY (categoryId)
        REFERENCES categories(id),
    FOREIGN KEY (storeId)
        REFERENCES stores(id)
);`

// create categories table
export const createCategoriesTable = `
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    category TEXT,
    subCategory TEXT,
    isDefault INTEGER
);`

// Drop Tables
export const dropStoreTable = 'DROP TABLE stores;'
export const dropItemsTable = 'DROP TABLE items;'
export const dropCategoriesTable = 'DROP TABLE categories;'
export const dropSettingsTable = 'DROP Table settings;'
export const dropUnitsTable = 'DROP TABLE units;'

// Settings
export const insertInitSetting = 'INSERT INTO settings (id, isInitiated) values (?,?);'
export const retrieveSettings = 'SELECT * FROM settings'

// Units
export const retrieveUnits = 'SELECT * FROM units;'

// Categories
export const retrieveCategories = 'SELECT * FROM categories;'

// Stores
export const insertStore = 'INSERT INTO stores (storeName, dateToGo, archiveDate, storeType) values (?,?,?,?);'
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
export const deleteItem = 'DELETE FROM items WHERE itemId=?;'
export const selectItems = 'SELECT * FROM items;'
export const insertStoreItem = `
    INSERT INTO items 
        (itemName, itemType, storeId, 
        categoryId, unitId, expirationDate, 
        quantity, amountOfUnit, priceAmount, 
        purchaseDate, archiveDate) 
        values 
        (?,?,?,?,?,?,?,?,?,?,?);`
export const updateItemAttributes = 'UPDATE items SET itemName=?, categoryId=?, unitId=?, expirationDate=?, quantity=?, amountOfUnit=?, priceAmount=?, purchaseDate=?, archiveDate=? WHERE itemId=?;'
export const insertInventoryItem = 'INSERT INTO items (itemName, itemType, storeId, purchaseDate) values (?,?,?,?);'
export const updateItemType = 'UPDATE items SET itemType=? WHERE itemId=?;'
export const updateItemPurchaseDate = 'UPDATE items SET purchaseDate=? WHERE itemId=?;'
export const updateItemArchiveDate = 'UPDATE items SET archiveDate=? WHERE itemId=?;'
export const updateItemsOnUpdateStoreType = 'UPDATE items SET itemType=? WHERE storeId=? AND itemType=?;'

// Items Join Stores
export const selectItemsByItemTypeAndStoreId = `
    SELECT * FROM items
        JOIN stores ON 
            items.storeId = stores.id 
        JOIN categories ON
            items.categoryId = categories.id
        JOIN units ON
            items.unitId = units.id
    WHERE itemType=? AND storeId=?;
`
export const selectAllItemJoinedStoresByItemType = `
    SELECT * FROM items 
        JOIN stores ON 
            items.storeId = stores.id 
        JOIN categories ON
            items.categoryId = categories.id
        JOIN units ON
            items.unitId = units.id
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
    INSERT INTO categories (category, subCategory, isDefault) values
    ("Uncategorized","",1),
    ("Groceries","",1),
    ("Groceries","Produce",1),
    ("Groceries","Meat",1),
    ("Groceries","Diary",1),
    ("Groceries","Packaged Goods",1),
    ("Groceries","Pantry Goods",1),
    ("Groceries","Frozen Goods",1)    
`