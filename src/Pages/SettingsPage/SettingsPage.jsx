import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { Card, Button, List } from 'react-native-paper';
import * as styles from './SettingsPage.styles';
//import { SettingsPageWrapper } from './SettingsPage.styles';
import * as SQLite from 'expo-sqlite';

import { deleteStores, deleteItems, dropItemsTable, dropStoreTable } from '../../Utils/SQLConstants';

const db = SQLite.openDatabase("grocerListPlus.db");

const SETTINGS = [
  {
    id: 1,
    description: 'Remove All Stores',
    title: 'Remove All Stores',
  },
  {
    id: 2,
    description: 'Remove All Items',
    title: 'Remove All Items'
  },
  {
    id: 3,
    description: 'Drop All Tables',
    title: 'Drop All Tables'
  }

];

class SettingsPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount = () => {
    console.debug('SettingsPage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  // getDerivedStateFromProps = (nextProps, prevState) => {
  //   console.debug('SettingsPage getDerivedStateFromProps', nextProps, prevState);
  // }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.debug('SettingsPage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.debug('SettingsPage did update');
  }

  componentWillUnmount = () => {
    console.debug('SettingsPage will unmount');
  }

  removeAllStores = () => {
    console.debug('Removing all stores')
    db.transaction((tx) => {
      tx.executeSql(deleteStores);
    },
      (error) => console.debug(error + '\ntransaction error'),
      () => console.debug('successful')
    )
  }

  removeAllItems = () => {
    console.debug('remove items')
    db.transaction((tx) => {
      tx.executeSql(deleteItems);
    },
      (error) => console.debug(error + '\ntransaction error'),
      () => console.debug('successful')
    )
  }

  removeAllTables = () => {
    console.debug('drop tables')
    db.transaction((tx) => {
      tx.executeSql(dropItemsTable);
      tx.executeSql(dropStoreTable);
    },
      (error) => console.debug(error + '\ntransaction error'),
      () => console.debug('successful')
    )
  }

  identifySQLQuery = (id) => {
    switch (id) {
      case 1:
        this.removeAllStores();
        break;
      case 2:
        this.removeAllItems();
        break;
      case 3:
        this.removeAllTables();
        break;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.SettingsPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <View style={styles.SettingsPageWrapper}>
        <List.Section>
          {SETTINGS.map(item =>
            <List.Item
              title={item.description}
              description={item.description}
              onPress={this.identifySQLQuery.bind(this,item.id)}
              />
          )}
        </List.Section>
      </View>
    );
  }
}

SettingsPage.propTypes = {
  // bla: PropTypes.string,
};

SettingsPage.defaultProps = {
  // bla: 'test',
};

export default SettingsPage;
