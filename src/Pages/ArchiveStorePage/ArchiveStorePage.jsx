import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import { Provider, Portal, Dialog, Text, Button } from 'react-native-paper';
import { styles } from './ArchiveStorePage.styles';
import {
  db, selectStoresByStoreType
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import { storeType } from '../../Utils/TypeConstants';

class ArchiveStorePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      storeNameText: '',
      data: [],
      isRefreshing: false,
      storeToDelete: null
    };
  }

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.queryStores()
    })
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  componentDidUpdate = () => {
    console.log('ArchiveStorePage did update');
  }

  componentWillUnmount = () => {
    console.log('ArchiveStorePage will unmount');
  }

  showDeleteStoreConfirmation = (id) => {
    this.setState({
      showDeleteStoreConfirmation: true,
      storeToDelete: id
    })
  }

  hideDeleteStoreConfirmation = () => {
    this.setState({
      showDeleteStoreConfirmation: false,
      storeToDelete: null
    })
  }

  deleteStore = () => {
    db.transaction(tx => {
      console.debug('exec deleteItemsByStoreId')
      tx.executeSql(deleteItemsByStoreId, [this.state.storeToDelete])
      console.debug('exec deleteStore')
      tx.executeSql(deleteStore, [this.state.storeToDelete])
    },
      (error) => console.debug(error),
      () => {
        console.debug('parent refresh')
        this.forceRefresh()
        this.hideDeleteStoreConfirmation()
      }
    )
  }

  forceRefresh = () => {
    this.setState({
      isRefreshing: true
    })
    this.queryStores()
    this.setState({
      isRefreshing: false
    })
  }

  queryStores() {
    console.debug('exec queryStores')
    db.transaction(tx => {
      tx.executeSql(
        selectStoresByStoreType,
        [storeType.ARCHIVE],
        (_, { rows: { _array } }) => {
          console.debug(_array)
          this.setState({
            data: _array
          })
          console.debug('success')
        },
        () => console.debug("Error")
      )
    })
  }

  render() {
    return (
      <Provider>
        <FlatList
          style={styles.HomePageWrapper}
          onRefresh={this.forceRefresh}
          refreshing={this.state.isRefreshing}
          data={this.state.data}
          renderItem={({ item, index, seperator }) => (
            <StoreListComponent
              key={item.id}
              store={item}
              forceRefreshFunction={this.forceRefresh}
              navigation={this.props.navigation}
              showDeleteStoreConfirmationFunc={this.showDeleteStoreConfirmation}
            />
          )}
        />
        {/* Confirm Deletion */}
        <Portal>
          <Dialog
            visible={this.state.showDeleteStoreConfirmation}
            onDismiss={this.hideDeleteStoreConfirmation}>
            <Dialog.Title>Delete Items</Dialog.Title>
            <Dialog.Content>
              <Text>
                Deleting items means that they will no longer be in inventory or in archive
							</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.hideDeleteStoreConfirmation}>Cancel</Button>
              <Button onPress={this.deleteStore}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Provider >
    );
  }
}

ArchiveStorePage.propTypes = {
  // bla: PropTypes.string,
};

ArchiveStorePage.defaultProps = {
  // bla: 'test',
};

export default ArchiveStorePage;
