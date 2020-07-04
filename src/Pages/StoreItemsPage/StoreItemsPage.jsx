import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import {
  List, Modal, Provider, Portal,
  Button, Dialog, Checkbox, Appbar
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import {
  db, deleteItem, selectUncheckedItems, insertItem, selectCheckedItems,
  changeToArchived, changeToUnarchived, updateDateToGo
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
      unarchivedData: [],
      archivedData: []
    };

    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
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
            this.queryAllUnarchivedItemsInStore()
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

  queryAllArchivedItemsInStore = () => {
    console.debug('all checked')
    db.transaction(tx => {
      tx.executeSql(
        selectCheckedItems,
        [this.state.storeId],
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
    console.debug('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToArchived, [id]
      )
    },
      () => console.debug('error'),
      () => {
        this.forceRefresh()
      })
  }

  changeToUnarchivedCheckBox = (id) => {
    console.debug('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToUnarchived,
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

  queryAllUnarchivedItemsInStore = () => {
    console.debug('all unchecked')
    db.transaction(tx => {
      tx.executeSql(
        selectUncheckedItems,
        [this.state.storeId],
        (_, { rows: { _array } }) => {
          this.setState({
            unarchivedData: _array
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
    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
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
                  left={() => <Checkbox.Item
                    label=''
                    status={item.isArchived ? 'checked' : 'unchecked'}
                    onPress={this.changeToUnarchivedCheckBox.bind(this, item.id)}
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

  render() {

    const archivedAccordianList = this.renderArchivedItems()
    const unarchivedAccordianList = this.renderUnarchivedItems()

    return (
      <Provider>
        <ScrollView
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
            {unarchivedAccordianList}

            {/* Checked off stuff */}
            {archivedAccordianList}
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
