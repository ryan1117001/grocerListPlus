import React, { PureComponent } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { styles } from './AllItemsPage.styles';
import { List, Button, Checkbox, Provider } from 'react-native-paper'

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
      isRefreshing: false
    };
  }

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.queryAllArchivedItems()
      this.queryAllUnarchivedItems()
    })
  }

  componentDidCatch(error, info) { }

  componentDidUpdate = () => { }

  componentWillUnmount = () => {
    this._unsubscribe();
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
    console.debug('changing checkbox status')
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
