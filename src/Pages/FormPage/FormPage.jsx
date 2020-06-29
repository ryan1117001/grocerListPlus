import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './FormPage.styles';

import { View, Text, ScrollView, TextInput, FlatList } from 'react-native';
import { List, Card, Modal, Provider, Portal, Button, FAB, Dialog, Checkbox } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import * as SQLite from 'expo-sqlite';

import { deleteItem, selectUncheckedItems, insertItem, selectCheckedItems, changeToArchived, changeToUnarchived, updateDateToGo } from '../../Utils/SQLConstants';

const db = SQLite.openDatabase('grocerListPlus.db');

class FormPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      showCalendarModal: false,
      showAddItemModal: false,
      selectedDate: props.route.params.dateToGo,
      storeName: props.route.params.storeName,
      storeId: props.route.params.storeId,
      itemNameText: '',
      unarchivedData: [],
      archivedData: []
    };

    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
  }

  componentDidMount = () => {
    console.log('FormPage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  getDerivedStateFromProps = (nextProps, prevState) => {
    console.log('FormPage getDerivedStateFromProps', nextProps, prevState);
  }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('FormPage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('FormPage did update');
  }

  componentWillUnmount = () => {
    console.log('FormPage will unmount');

  }

  hideCalendarModal = () => {
    this.setState({
      showCalendarModal: false
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

  hideAddItemModal = () => {
    this.setState({
      showAddItemModal: false
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
        () => console.log('Success'),
        () => console.log('Error')
      )
    })
  }

  addItem = () => {
    if (this.state.itemNameText !== '') {
      db.transaction(tx => {
        tx.executeSql(insertItem,
          [this.state.itemNameText, this.state.storeId],
          () => {
            console.log('Success')
            this.setState({
              itemNameText: ''
            })
          },
          () => console.log('Error')
        )
      })
      this.queryAllUnarchivedItemsInStore()
      this.hideAddItemModal()
    }
  }

  deleteItem = (id) => {
    console.log('delete item')
    db.transaction(tx => {
      tx.executeSql(
        deleteItem,
        [id],
        () => console.log('success'),
        () => console.log('error')
      )
    })

    // TODO: distinguish which when to reload on delete
    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
  }

  queryAllArchivedItemsInStore = () => {
    console.log('all checked')
    db.transaction(tx => {
      tx.executeSql(
        selectCheckedItems,
        [this.state.storeId],
        (_, { rows: { _array } }) => {
          // console.log(_array)
          this.setState({
            archivedData: _array
          })
        },
        () => console.log('Error')
      )
    })
  }

  changeToArchivedCheckBox = (id) => {
    console.log('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToArchived,
        [id],
        () => console.log('success'),
        () => console.log('error')
      )
    })
    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
  }

  changeToUnarchivedCheckBox = (id) => {
    console.log('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToUnarchived,
        [id],
        () => console.log('success'),
        () => console.log('error')
      )
    })
    // TODO: distinguish which when to reload on delete
    this.queryAllArchivedItemsInStore()
    this.queryAllUnarchivedItemsInStore()
  }

  queryAllUnarchivedItemsInStore = () => {
    console.log('all unchecked')
    db.transaction(tx => {
      tx.executeSql(
        selectUncheckedItems,
        [this.state.storeId],
        (_, { rows: { _array } }) => {
          // console.log(_array)
          this.setState({
            unarchivedData: _array
          })
        },
        () => console.log('Error')
      )
    })
  }

  renderCheckedItems = () => {
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
                      icon='dots-vertical'
                      onPress={this.deleteItem.bind(this, item.id)}
                    />
                  }
                  title={item.itemName}
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

  renderUncheckedItems = () => {
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

    const checkedAccordianList = this.renderCheckedItems()
    const uncheckedList = this.renderUncheckedItems()

    if (this.state.hasError) {
      return (
        <View style={styles.FormPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <Provider>
        <ScrollView style={styles.FormPageWrapper}>
          {/* Store name and dates */}

          <View style={styles.TitleRowWrapper}>
            <Text>
              {this.state.storeName}
            </Text>

            <Button
              onPress={this.showCalendarModal}
            >
              {this.state.selectedDate}
            </Button>
          </View>
          {/* Showing data */}
          <List.Section>
            <List.Item
              title='Add An Item!'
              onPress={this.showAddItemModal}
            />

            {/* Unchecked off stuff*/}
            {uncheckedList}

            {/* Checked off stuff */}
            {checkedAccordianList}
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
                onMonthChange={(month) => { console.log('month changed', month) }}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={true}
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
        <FAB
          style={styles.fab}
          small
          icon='plus'
          onPress={this.showAddItemModal}
        />
      </Provider>

    );
  }
}

FormPage.propTypes = {
  // bla: PropTypes.string,
  store: PropTypes.object
};

FormPage.defaultProps = {
  // bla: 'test',
};

export default FormPage;
