import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from './FoodPage.styles';
import { List, Button, Checkbox, Provider } from 'react-native-paper'

import {
  db, selectAllArchivedItems, selectAllUnarchivedItems,
  changeToArchived, changeToUnarchived, deleteItem
} from '../../Utils/SQLConstants';

// const db = SQLite.openDatabase('grocerListPlus.db');

class FoodPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      showAddFoodModal: false,
      unarchivedData: [],
      archivedData: []
    };
  }

  componentDidMount = () => {
    // console.log('FoodPage mounted');
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.queryAllArchivedItems()
      this.queryAllUnarchivedItems()
    })
  }

  // static getDerivedStateFromError(error) {
  //   // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
  //   return { hasError: true };
  // }

  // componentDidCatch(error, info) {
  //   // You can also log the error to an error reporting service
  // }

  // // getDerivedStateFromProps = (nextProps, prevState) => {
  // //   console.log('FoodPage getDerivedStateFromProps', nextProps, prevState);
  // // }

  // getSnapshotBeforeUpdate = (prevProps, prevState) => {
  //   console.log('FoodPage getSnapshotBeforeUpdate', prevProps, prevState);
  // }

  // componentDidUpdate = () => {
  //   console.log('FoodPage did update');
  // }

  componentWillUnmount = () => {
    // console.log('FoodPage will unmount');
    this._unsubscribe();
  }

  queryAllArchivedItems = () => {
    console.log('all checked')
    db.transaction(tx => {
      tx.executeSql(
        selectAllArchivedItems,
        [],
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
    // console.log('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToArchived,
        [id],
        () => {
          console.debug('success')
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
        },
        () => console.log('error')
      )
    })

  }

  changeToUnarchivedCheckBox = (id) => {
    console.log('changing checkbox status')
    db.transaction(tx => {
      tx.executeSql(
        changeToUnarchived,
        [id],
        () => {
          console.log('success')
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
        },
        () => console.log('error')
      )
    })
  }

  queryAllUnarchivedItems = () => {
    console.log('all unchecked')
    db.transaction(tx => {
      tx.executeSql(
        selectAllUnarchivedItems,
        [],
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

  deleteItem = (id) => {
    console.log('delete item')
    db.transaction(tx => {
      tx.executeSql(
        deleteItem,
        [id],
        () => {
          console.log('success')
          // TODO: distinguish which when to reload on delete
          this.queryAllArchivedItems()
          this.queryAllUnarchivedItems()
        },
        () => console.log('error')
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
  render() {
    const checkedAccordianList = this.renderCheckedItems()
    const uncheckedList = this.renderUncheckedItems()

    if (this.state.hasError) {
      return (
        <View style={styles.FoodPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <Provider>
        <ScrollView style={styles.FoodPageWrapper}>
          {/* Showing data */}
          <List.Section>

            {/* Unchecked off stuff*/}
            {uncheckedList}

            {/* Checked off stuff */}
            {checkedAccordianList}
          </List.Section>
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
