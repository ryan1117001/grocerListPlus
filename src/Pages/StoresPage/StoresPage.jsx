import React, { PureComponent } from 'react';
import { View, FlatList, RefreshControl, TextInput } from 'react-native';
import { styles } from './StoresPage.styles';
import { Card, Button, Dialog, Portal, Provider, Appbar } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import {
  db, insertStore, selectStores, deleteStore, deleteItemsByStoreId
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
    navigate('Store Items', { storeName: store.storeName, storeId: store.id, dateToGo: store.dateToGo })
  }

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
    //TODO: Delete related items
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
    if (this.state.hasError) {
      return (
        <View style={styles.HomePageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <Provider>
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
                  right={() => <Button onPress={this.deleteStore.bind(this, item.id)}> Delete </Button>}
                />
              </Card>
            )}
          />
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={this.showAddStoreModal}
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
