import React, { PureComponent } from 'react'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import { styles } from './AllItemsPage.styles'
import { List, Button, Checkbox, Provider, Appbar, Portal, Dialog, Text } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
  db, selectAllArchivedItems, selectAllUnarchivedItems,
  changeToArchived, changeToUnarchived, deleteItem, selectStores,
  insertItem
} from '../../Utils/SQLConstants';

class AllItemsPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unarchivedData: [],
      archivedData: [],
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
          this.setState({
            stores: _array,
            selectedStoreId: _array[0].id
          })
        },
        () => console.debug("Error")
      )
    })
  }

  queryAllArchivedItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        selectAllArchivedItems,
        [],
        (_, { rows: { _array } }) => {
          this.setState({
            archivedData: _array
          })
        },
        () => console.debug('Error')
      )
    })
  }

  changeToArchivedCheckBox = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        changeToArchived,
        [id],
        () => {
          console.debug('success')
          this.forceRefresh()
        },
        () => console.debug('error')
      )
    })

  }

  changeToUnarchivedCheckBox = (id) => {
    console.debug('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToUnarchived,
        [id],
        () => {
          console.debug('success')
          this.forceRefresh()
        },
        () => console.debug('error')
      )
    })
  }

  queryAllUnarchivedItems = () => {
    db.transaction(tx => {
      tx.executeSql(
        selectAllUnarchivedItems,
        [],
        (_, { rows: { _array } }) => {
          this.setState({
            unarchivedData: _array
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
            this.queryAllUnarchivedItems()
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
    this.queryAllArchivedItems()
    this.queryAllUnarchivedItems()
    this.queryAllStores()
    this.setState({
      isRefreshing: false,
    })
  }

  renderArchivedItems = () => {
    if (this.state.archivedData.length > 0) {
      return (
        <View>
          <List.Accordion
            title='Deleted Stuff'
            left={props => <List.Icon {...props} icon='folder' />}
          >
            {this.state.archivedData.map((item) => {
              return (
                <List.Item
                  left={() =>
                    <Checkbox.Item
                      label=''
                      status={item.isArchived ? 'checked' : 'unchecked'}
                      onPress={this.changeToUnarchivedCheckBox.bind(this, item.id)}
                    />
                  }
                  right={() =>
                    <Button
                      icon='dots-vertical'
                      onPress={this.deleteItem.bind(this, item.id)}
                    >
                      Delete
                  </Button>
                  }
                  description={item.dateToGo + " | " + item.storeName}
                  title={item.itemName}
                  key={item.id}
                />
              )
            })}
          </List.Accordion>
        </View>
      )
    }
    else {
      return <View />
    }
  }

  renderUnarchivedItems = () => {
    if (this.state.unarchivedData.length > 0) {
      return (
        this.state.unarchivedData.map((item) => {
          return (
            <List.Item
              left={() => <Checkbox.Item
                label=''
                status={item.isArchived ? 'checked' : 'unchecked'}
                onPress={this.changeToArchivedCheckBox.bind(this, item.id)}
              />}
              right={() =>
                <Button
                  icon='dots-vertical'
                  onPress={this.deleteItem.bind(this, item.id)}
                />
              }
              title={item.itemName}
              description={item.dateToGo + " | " + item.storeName}
              key={item.id}

            />
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
    const archivedAccordianList = this.renderArchivedItems()
    const unarchivedAccordianList = this.renderUnarchivedItems()

    if (this.state.hasError) {
      return (
        <View style={styles.FoodPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <Provider>
        <Appbar.Header>
          <Appbar.Content title={'All Items'} />
          <Appbar.Action icon='magnify' onPress={() => { }} />
          <Appbar.Action icon='plus' onPress={this.showAddAllItemModal} />
          <Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
        </Appbar.Header>
        <ScrollView style={styles.AllItemsPageWrapper} refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this.forceRefresh}
          />
        }>
          {/* Showing data */}
          <List.Section>

            {/* Unchecked off stuff*/}
            {unarchivedAccordianList}

            {/* Checked off stuff */}
            {archivedAccordianList}
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

AllItemsPage.propTypes = {
  // bla: PropTypes.string,
};

AllItemsPage.defaultProps = {
  // bla: 'test',
};

export default AllItemsPage;
