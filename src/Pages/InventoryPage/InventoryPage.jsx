import React, { PureComponent } from 'react'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import { styles } from './InventoryPage.styles'
import { List, Button, Checkbox, Provider, Appbar, Portal, Dialog, Text, Surface } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
  db, selectAllInventoriedItems, selectAllUninventoriedItems,
  changeToInventoried, changeToUninventoried, deleteItem, selectStores,
  insertItem
} from '../../Utils/SQLConstants';

class InventoryPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      uninventoriedData: [],
      inventoriedData: [],
      isRefreshing: false,
      showAddAllItemModal: false,
      itemNameText: '',
      stores: [],
      selectedStoreId: 0,
      textInput: '',
    };
  }

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.forceRefresh()
    })
  }

  componentDidCatch(error, info) { }

  componentDidUpdate = () => { }

  componentWillUnmount = () => {
    this._unsubscribe();
  }

  queryAllStores() {
    db.transaction(tx => {
      tx.executeSql(
        selectStores,
        [],
        (_, { rows: { _array } }) => {

          if (_array.length > 0) {
            this.setState({
              stores: _array,
              selectedStoreId: _array[0].id
            })
          }
        },
        () => console.debug("Error")
      )
    })
  }

  queryAllInventoriedItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        selectAllInventoriedItems,
        [],
        (_, { rows: { _array } }) => {
          this.setState({
            inventoriedData: _array
          })
        },
        () => console.debug('Error')
      )
    })
  }

  changeToInventoriedCheckBox = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        changeToInventoried,
        [id],
        () => {
          console.debug('success')
          this.forceRefresh()
        },
        () => console.debug('error')
      )
    })

  }

  changeToUninventoriedCheckBox = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        changeToUninventoried,
        [id],
        () => {
          console.debug('success')
          this.forceRefresh()
        },
        () => console.debug('error')
      )
    })
  }

  queryAllUninventoriedItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        selectAllUninventoriedItems,
        [],
        (_, { rows: { _array } }) => {
          this.setState({
            uninventoriedData: _array
          })
        },
        () => console.debug('Error')
      )
    })
  }

  deleteItem = (id) => {
    console.debug('delete item')
    db.transaction(tx => {
      tx.executeSql(
        deleteItem,
        [id],
        () => {
          console.debug('success')
          this.forceRefresh()
        },
        () => console.debug('error')
      )
    })
  }

  addItem = () => {
    if (this.state.itemNameText !== '') {
      console.debug(this.state.itemNameText, this.state.selectedStoreId)
      db.transaction(tx => {
        tx.executeSql(insertItem,
          [this.state.itemNameText, this.state.selectedStoreId],
          () => {
            console.debug('success')
            this.queryAllUninventoriedItems()
            this.hideAddAllItemModal()
            this.setState({
              itemNameText: '',
              selectedStoreId: ''
            })
          },
          () => {
            console.debug('Error')
            this.hideAddAllItemModal()
          }
        )
      })
    }
  }

  showAddAllItemModal = () => {
    this.setState({
      showAddAllItemModal: true
    })
  }

  hideAddAllItemModal = () => {
    this.setState({
      showAddAllItemModal: false
    })
  }

  forceRefresh = () => {
    this.setState({
      isRefreshing: true
    })
    this.queryAllInventoriedItems()
    this.queryAllUninventoriedItems()
    this.queryAllStores()
    this.setState({
      isRefreshing: false,
    })
  }

  renderInventoriedItems = () => {
    if (this.state.inventoriedData.length > 0) {
      return (
        this.state.inventoriedData.map((item) => {
          return (
            <Surface
              key={item.id}
              style={styles.Surface}
            >
              <List.Item
                left={() =>
                  <Checkbox.Item
                    label=''
                    status={item.isInventoried ? 'checked' : 'unchecked'}
                    onPress={this.changeToUninventoriedCheckBox.bind(this, item.id)}
                  />
                }
                right={() =>
                  <Button
                    onPress={this.deleteItem.bind(this, item.id)}
                  >
                    Delete
                  </Button>
                }
                description={item.dateToGo + " | " + item.storeName}
                title={item.itemName}
                key={item.id}
              />
            </Surface>
          )
        })
      )
    }
    else {
      return <View />
    }
  }

  renderUninventoriedItems = () => {
    if (this.state.uninventoriedData.length > 0) {
      return (
        this.state.uninventoriedData.map((item) => {
          return (
            <Surface
              key={item.id}
              style={styles.Surface}>
              <List.Item
                left={() => <Checkbox.Item
                  label=''
                  status={item.isInventoried ? 'checked' : 'unchecked'}
                  onPress={this.changeToInventoriedCheckBox.bind(this, item.id)}
                />}
                right={() =>
                  <Button
                    onPress={this.deleteItem.bind(this, item.id)}
                  >
                    Delete
              </Button>
                }
                title={item.itemName}
                description={item.dateToGo + " | " + item.storeName}
                key={item.id}

              />
            </Surface>
          )
        })
      )
    }
    else {
      return <View />
    }
  }

  renderPickerItems = () => {
    if (this.state.stores.length > 0) {
      return (
        this.state.stores.map((item) => {
          return (
            <Picker.Item key={item.id} label={item.storeName} value={item.id} />
          )
        })
      )
    }
  }
  render() {
    const inventoriedAccordianList = this.renderInventoriedItems()
    const uninventoriedAccordianList = this.renderUninventoriedItems()
    const pickerValueList = this.renderPickerItems()

    return (
      <Provider>
        <Appbar.Header>
          <Appbar.Content title={'All Items'} />
          <Appbar.Action icon='magnify' onPress={() => { }} />
          <Appbar.Action icon='plus' onPress={this.showAddAllItemModal} />
          <Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
        </Appbar.Header>
        <ScrollView style={styles.InventoryPageWrapper} refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.forceRefresh}
          />
        }>
          {/* Showing data */}
          <List.Section>

            {/* Checked off stuff */}
            {inventoriedAccordianList}

            {/* Unchecked off stuff*/}
            {uninventoriedAccordianList}

          </List.Section>
          <Portal>
            <Dialog
              visible={this.state.showAddAllItemModal}
              onDismiss={this.hideAddAllItemModal}>
              <Dialog.ScrollArea>
                <Dialog.Title>
                  Add Item
                </Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    style={styles.dialogTextInput}
                    mode='outlined'
                    placeholder={'Item Name'}
                    onChangeText={text => this.setState({ itemNameText: text })}
                  />
                  <View>
                    <Text>
                      Stores
                    </Text>
                    <Picker
                      selectedValue={this.state.selectedStoreId}
                      onValueChange={(itemValue, itemIndex) => {
                        this.setState({ selectedStoreId: itemValue })
                      }
                      }
                      mode='dropdown'
                    >
                      {pickerValueList}
                    </Picker>
                  </View>

                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={this.hideAddAllItemModal}>Cancel</Button>
                  <Button onPress={this.addItem}>Done</Button>
                </Dialog.Actions>
              </Dialog.ScrollArea>
            </Dialog>
          </Portal>
        </ScrollView>
      </Provider>
    );
  }
}

InventoryPage.propTypes = {
  // bla: PropTypes.string,
};

InventoryPage.defaultProps = {
  // bla: 'test',
};

export default InventoryPage;
