import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import {
  List, Modal, Provider, Portal,
  Button, Dialog, Checkbox, Appbar, Surface
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import {
  db, deleteItem, selectUncheckedItems, insertItem, selectCheckedItems,
  changeToInventoried, changeToUninventoried, updateDateToGo
} from '../../Utils/SQLConstants';

class StoreItemsPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showCalendarModal: false,
      showAddItemModal: false,
      selectedDate: props.route.params.dateToGo,
      storeName: props.route.params.storeName,
      storeId: props.route.params.storeId,
      itemNameText: '',
      isRefreshing: false,
      uninventoriedData: [],
      inventoriedData: []
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

  hideCalendarModal = () => {
    this.setState({
      showCalendarModal: false
    })
  }

  hideAddItemModal = () => {
    this.setState({
      showAddItemModal: false
    })
  }

  showCalendarModal = () => {
    this.setState({
      showCalendarModal: true
    })
  }

  showAddItemModal = () => {
    this.setState({
      showAddItemModal: true
    })
  }

  selectDate = (day) => {
    var date = new Date(Date.UTC(day.year, day.month - 1, day.day + 1))
    this.setState({
      selectedDate: date.toLocaleDateString()
    })
    this.updateDate()
    this.hideCalendarModal()
  }

  updateDate = () => {
    db.transaction(tx => {
      tx.executeSql(updateDateToGo,
        [this.state.selectedDate, this.state.storeId],
        () => console.debug('Success'),
        () => console.debug('Error')
      )
    })
  }

  addItem = () => {
    if (this.state.itemNameText !== '') {
      db.transaction(tx => {
        tx.executeSql(insertItem,
          [this.state.itemNameText, this.state.storeId],
          () => {
            console.debug('Success')
            this.queryAllUninventoriedItemsInStore()
            this.hideAddItemModal()
            this.setState({
              itemNameText: ''
            })
          },
          () => console.debug('Error')
        )
      })
    }
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

  queryAllInventoriedItemsInStore = () => {
    console.debug('all checked')
    db.transaction(tx => {
      tx.executeSql(
        selectCheckedItems,
        [this.state.storeId],
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
    console.debug('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToInventoried, [id]
      )
    },
      () => console.debug('error'),
      () => {
        this.forceRefresh()
      })
  }

  changeToUninventoriedCheckBox = (id) => {
    console.debug('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToUninventoried,
        [id],
        () => console.debug('success'),
        () => console.debug('error')
      )
    },
      (error) => console.debug(error),
      () => {
        this.forceRefresh()
      })
  }

  queryAllUninventoriedItemsInStore = () => {
    console.debug('all unchecked')
    db.transaction(tx => {
      tx.executeSql(
        selectUncheckedItems,
        [this.state.storeId],
        (_, { rows: { _array } }) => {
          this.setState({
            uninventoriedData: _array
          })
        },
        () => console.debug('Error')
      )
    })
  }

  forceRefresh = () => {
    this.setState({
      isRefreshing: true
    })
    this.queryAllInventoriedItemsInStore()
    this.queryAllUninventoriedItemsInStore()
    this.setState({
      isRefreshing: false
    })
  }

  renderInventoriedItems = () => {
    if (this.state.inventoriedData.length > 0) {
      return (
        this.state.inventoriedData.map((item) => {
          return (
            <Surface
              style={styles.Surface}
              key={item.id}
            >
              <List.Item
                left={() => <Checkbox.Item
                  label=''
                  status={item.isInventoried ? 'checked' : 'unchecked'}
                  onPress={this.changeToUninventoriedCheckBox.bind(this, item.id)}
                />}
                right={() =>
                  <Button
                    onPress={this.deleteItem.bind(this, item.id)}
                  >
                    Delete
                      </Button>
                }
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
            <Surface style={styles.Surface}>
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

  render() {

    const inventoriedAccordianList = this.renderInventoriedItems()
    const uninventoriedAccordianList = this.renderUninventoriedItems()

    return (
      <Provider>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => { this.props.navigation.goBack() }} />
          <Appbar.Content subtitle={'Store Items'} title={this.state.storeName} />
          <Appbar.Action icon='magnify' onPress={() => { }} />
          <Appbar.Action icon='plus' onPress={this.showAddItemModal} />
          <Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
        </Appbar.Header>
        <ScrollView
          style={styles.StoreItemsPageWrapper}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.forceRefresh}
            />
          }
          style={styles.StoreItemsPageWrapper}
        >
          {/* Store name and dates */}

          <View style={styles.TitleRowWrapper}>
            <Button
              onPress={this.showAddItemModal}
            >
              Add An Item
            </Button>
            <Button
              onPress={this.showCalendarModal}
            >
              {this.state.selectedDate}
            </Button>
          </View>
          {/* Showing data */}
          <List.Section>
            {/* Unchecked off stuff*/}
            {uninventoriedAccordianList}

            {/* Checked off stuff */}
            {inventoriedAccordianList}
          </List.Section>


          <Portal>
            <Modal visible={this.state.showCalendarModal} onDismiss={this.hideCalendarModal}>
              <Calendar
                style={styles.CalendarWrapper}
                theme={{
                  selectedDayBackgroundColor: '#00adf5',
                  todayTextColor: '#00adf5'
                }}
                // Handler which gets executed on day press. Default = undefined
                onDayPress={this.selectDate}
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'MMM yyyy'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => { console.debug('month changed', month) }}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={false}
                // Show week numbers to the left. Default = false
                showWeekNumbers={true}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                onPressArrowLeft={substractMonth => substractMonth()}
                // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                onPressArrowRight={addMonth => addMonth()}
              />
            </Modal>
          </Portal>

          <Portal>
            <Dialog
              visible={this.state.showAddItemModal}
              onDismiss={this.hideAddItemModal}>
              <Dialog.Title>Add Item</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  placeholder={'Item Name'}
                  onChangeText={text => this.setState({ itemNameText: text })}
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={this.hideAddItemModal}>Cancel</Button>
                <Button onPress={this.addItem}>Done</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </Provider>

    );
  }
}

StoreItemsPage.propTypes = {
  // bla: PropTypes.string,
  store: PropTypes.object
};

StoreItemsPage.defaultProps = {
  // bla: 'test',
};

export default StoreItemsPage;
