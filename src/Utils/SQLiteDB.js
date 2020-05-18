import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("grocerListPlus.db");

const createItemTable = 'Select d'

export default class SQLiteDB {

    initDB() {
        console.log('creating table if necessery')
        db.transaction((tx) => {
            console.log('execute order 66')
        },
            (error) => console.log(error + '\ntransaction error'),
            () => console.log('successful transaction')
        )
    }

    removeDB() {
        console.log('creating table if necessery')
        db.transaction((tx) => {
            console.log('execute order 66')
        },
            (error) => console.log(error + '\ntransaction error'),
            () => console.log('successful transaction')
        )
    }

    addFood() {
        db.transaction((tx) => {
            console.log('execute order 66')
        },
            (error) => console.log(error + '\ntransaction error'),
            () => console.log('successful transaction')
        )
    }

    removeFood() {
        db.transaction((tx) => {
            console.log('execute order 66')
        },
            (error) => console.log(error + '\ntransaction error'),
            () => console.log('successful transaction')
        )
    }

    isChecked() {
        db.transaction((tx) => {
            console.log('execute order 66')
        },
            (error) => console.log(error + '\ntransaction error'),
            () => console.log('successful transaction')
        )
    }
}