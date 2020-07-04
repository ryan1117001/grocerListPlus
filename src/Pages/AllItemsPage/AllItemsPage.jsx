import React, { PureComponent } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { styles } from './AllItemsPage.styles'
import { List, Button, Checkbox, Provider, Appbar } from 'react-native-paper'
import {Picker} from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
  db, selectAllArchivedItems, selectAllUnarchivedItems,
  changeToArchived, changeToUnarchived, deleteItem
} from '../../Utils/SQLConstants';

class FoodPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAddFoodModal: false,
      unarchivedData: [],
      archivedData: [],
      isRefreshing: false,
      showAddAllItemModal: false,
      itemNameText: '',
      stores: [],
      selectedStore: ''
    };
  }

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.queryAllArchivedItems()
      this.queryAllUnarchivedItems()
      this.queryAllStores()
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
            stores: _array
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
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
        },
        () => console.debug('error')
      )
    })

  }

  changeToUnarchivedCheckBox = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        changeToUnarchived,
        [id],
        () => {
          console.debug('success')
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
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
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
        },
        () => console.debug('error')
      )
    })
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
    this.setState({
      isRefreshing: false
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
                  left={() => {
                    <Checkbox.Item
                      label=''
                      status={item.isArchived ? 'checked' : 'unchecked'}
                      onPress={this.changeToUnarchivedCheckBox.bind(this, item.id)}
                    />
                  }}
                  right={() => {
                    <Button
                      onPress={this.deleteItem.bind(this, item.id)}
                    >
                      Delete
                  </Button>
                  }}
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
                  onPress={this.deleteItem.bind(this, item.id)}
                >
                  Delete
              </Button>
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
           return(
             <Picker.Item label={item.storeName} value={item.id} />
           )
         })
       )
    }
  }
  render() {
    const archivedAccordianList = this.renderArchivedItems()
    const unarchivedAccordianList = this.renderUnarchivedItems()
    const pickerValueList = this.renderPickerItems()

    return (
      <Provider>
        <Appbar.Header>
          <Appbar.Content title={'All Items'} />
          <Appbar.Action icon='magnify' onPress={() => { }} />
          <Appbar.Action icon='plus' onPress={this.showAddAllItemModal} />
          <Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
        </Appbar.Header>
        <ScrollView style={styles.FoodPageWrapper} refreshControl={
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
              <Dialog.Title>Add Item</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  placeholder={'Item Name'}
                  onChangeText={text => this.setState({ itemNameText: text })}
                />
                <Picker
                  selectedValue={this.state.selectedStore}
                  onValueChange={(itemValue, itemIndex) => 
                    this.setState({selectedStore: itemValue})
                  }
                  
                >
                  
                </>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={this.hideAddAllItemModal}>Cancel</Button>
                <Button onPress={}>Done</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </Provider>
    );
  }
}

FoodPage.propTypes = {
  // bla: PropTypes.string,
};

FoodPage.defaultProps = {
  // bla: 'test',
};

export default FoodPage;
