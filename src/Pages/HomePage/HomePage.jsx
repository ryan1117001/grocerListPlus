import React, { PureComponent } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './HomePage.styles';
import { FAB, Card, Modal, Button, Paragraph, Dialog, Portal, Provider } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import { enableFK, createItemsTable, createStoresTable, insertStore, selectStores, deleteStore } from '../../Utils/SQLConstants';
import * as SQLite from 'expo-sqlite';

//import { HomePageWrapper } from './HomePage.styles';

const db = SQLite.openDatabase("grocerListPlus.db");

class HomePage extends PureComponent {
  constructor(props) {
    super(props);


    this.state = {
      hasError: false,
      showAddStoreModal: false,
      storeNameText: "",
      data: [],
      isRefreshing: false
    };
    // Init tables
    this.initDB();
    this.queryAllStores()
  }

  componentDidMount = () => {
    console.log('HomePage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  // static getDerivedStateFromProps = (nextProps, prevState) => {
  //   console.log('HomePage getDerivedStateFromProps', nextProps, prevState);
  // }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('HomePage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('HomePage did update');
  }

  componentWillUnmount = () => {
    console.log('HomePage will unmount');
  }

  navigateToForm = () => {
    console.log("Navigate to Form")
    navigate('Forms', null)
  }

  initDB = () => {
    console.log('creating table if necessery')
    db.transaction((tx) => {
      tx.executeSql(enableFK);
      tx.executeSql(createStoresTable);
      tx.executeSql(createItemsTable)
    },
      (error) => console.log(error + '\ntransaction error'),
      () => console.log('successful init')
    )
  };

  queryAllStores() {
    var isSuccess = false;
    db.transaction(tx => {
      tx.executeSql(
        selectStores,
        [],
        (_, { rows: { _array } }) => {
          console.log(_array)
          this.setState({
            data: _array
          })
          isSuccess = true
        },
        () => console.log("Error")
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
    db.transaction(tx => {
      tx.executeSql(insertStore, [this.state.storeNameText],
        () => console.log("Success"),
        () => console.log("Error")
      )
    })
    this.hideAddStoreModal()
    this.queryAllStores()
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
      tx.executeSql(deleteStore, [id],
        () => console.log("Success"),
        () => console.log("Error")
      )
    })
    
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
              <Card>
                <Card.Title title={item.storeName} subtitle={item.id} />
                <Card.Actions>
                  <Button onPress={this.navigateToForm} > OK </Button>
                  <Button onPress={this.deleteStore.bind(this,item.id)}> Delete </Button>
                </Card.Actions>
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

HomePage.propTypes = {
  // bla: PropTypes.string,
};

HomePage.defaultProps = {
  // bla: 'test',
};

export default HomePage;
