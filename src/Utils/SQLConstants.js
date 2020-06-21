// enable foriegn keys
export const enableFK = `PRAGMA foreign_keys = ON;`;

// create stores table
export const createStoresTable =  `
CREATE TABLE IF NOT EXISTS stores ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    storeName TEXT
);`;

// create items table
export const createItemsTable = `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    itemName TEXT,
    isArchived INTEGER,
    storeId INTEGER NOT NULL,
    FOREIGN KEY (storeId)
        REFERENCES stores(id)
);`;

export const insertStore = "INSERT INTO stores (storeName) values (?);"

export const deleteStores = "DELETE FROM stores;"

export const deleteStore = "DELETE FROM stores where id=?"

export const selectStores = "SELECT * FROM stores;"

export default function () {
    return
};