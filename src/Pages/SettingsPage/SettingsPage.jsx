import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { List, Appbar } from 'react-native-paper';
import * as styles from './SettingsPage.styles';
import { db, deleteStores, deleteItems, dropItemsTable, dropStoreTable } from '../../Utils/SQLConstants';

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

  componentDidMount = () => { }

  componentDidCatch(error, info) { }

  getSnapshotBeforeUpdate = (prevProps, prevState) => { }

  componentDidUpdate = () => { }

  componentWillUnmount = () => { }

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
    return (
      <View style={styles.SettingsPageWrapper}>
        <List.Section>
          {SETTINGS.map(item =>
            <List.Item
              key={item.id}
              title={item.description}
              description={item.description}
              onPress={this.identifySQLQuery.bind(this, item.id)}
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
