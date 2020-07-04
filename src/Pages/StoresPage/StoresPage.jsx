import React, { PureComponent } from 'react';
import { View, FlatList, TextInput, RefreshControl } from 'react-native';
import { styles } from './StoresPage.styles';
import { FAB, Card, Button, Dialog, Portal, Provider, Appbar } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import {
  db, enableFK, createItemsTable,
  createStoresTable, insertStore, selectStores, deleteStore, deleteItemsByStoreId
} from '../../Utils/SQLConstants';

class StoresPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showAddStoreModal: false,
      storeNameText: '',
      data: [],
      isRefreshing: false
    };
    // Init tables
    this.initDB();

  }

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.queryAllStores()
    })
  }

  componentDidCatch(error, info) { }

  componentDidUpdate = () => { }

  componentWillUnmount = () => {
    this._unsubscribe();
  }

  navigateToForm = (store) => {
    navigate('storeItems', {
      storeName: store.storeName,
      storeId: store.id,
      dateToGo: store.dateToGo
    })
  }

  initDB = () => {
    db.transaction((tx) => {
      tx.executeSql(enableFK);
      tx.executeSql(createStoresTable);
      tx.executeSql(createItemsTable)
    },
      (error) => console.debug(error),
      () => console.debug('successful init')
    )
  };

  queryAllStores() {
    db.transaction(tx => {
      tx.executeSql(
        selectStores,
        [],
        (_, { rows: { _array } }) => {
          this.setState({
            data: _array
          })
        },
        () => console.debug("Error")
      )
    })
  }

  showAddStoreModal = () => {
    this.setState({
      showAddStoreModal: true
    });
  };

  hideAddStoreModal = () => {
    this.setState({
      showAddStoreModal: false
    });
  }

  addStoreName = () => {
    var date = new Date().toLocaleDateString()
    db.transaction(tx => {
      tx.executeSql(insertStore, [this.state.storeNameText, date],
        () => {
          console.debug("Success")
          this.hideAddStoreModal()
          this.queryAllStores()
        },
        () => console.debug("Error")
      )
    })
  }

  forceRefresh = () => {
    this.setState({
      isRefreshing: true
    })
    this.queryAllStores()
    this.setState({
      isRefreshing: false
    })
  }

  deleteStore = (id) => {
    db.transaction(tx => {
      tx.executeSql(deleteItemsByStoreId, [id])
      tx.executeSql(deleteStore, [id])
    },
      (error) => console.debug(error),
      () => {
        this.queryAllStores()
      }
    )

  }

  render() {
    return (
      <Provider>
        <Appbar.Header>
          <Appbar.Content title='Stores' />
          <Appbar.Action icon='magnify' onPress={() => { }} />
          <Appbar.Action icon='plus' onPress={this.showAddStoreModal} />
          <Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
        </Appbar.Header>
        <View style={styles.HomePageWrapper}>
          <FlatList
            data={this.state.data}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this.forceRefresh}
              />
            }
            renderItem={({ item, index, separators }) => (
              <Card
                onPress={this.navigateToForm.bind(this, item)}
              >
                <Card.Title
                  title={item.storeName} subtitle={item.dateToGo}
                  right={() =>
                    <Button
                      onPress={this.deleteStore.bind(this, item.id)}
                    >
                      Delete
                  </Button>
                  }
                />
              </Card>
            )}
          />
        </View>
        <Portal>
          <Dialog
            visible={this.state.showAddStoreModal}
            onDismiss={this.hideAddStoreModal}>
            <Dialog.Title>Add A Store</Dialog.Title>
            <Dialog.Content>
              <TextInput
                placeholder={"Store Name"}
                onChangeText={text => this.setState({ storeNameText: text })}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.hideAddStoreModal}>Cancel</Button>
              <Button onPress={this.addStoreName}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Provider>
    );
  }
}

StoresPage.propTypes = {
  // bla: PropTypes.string,
};

StoresPage.defaultProps = {
  // bla: 'test',
};

export default StoresPage;
