import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { Card, Button } from 'react-native-paper';
import * as styles from './SettingsPage.styles';
//import { SettingsPageWrapper } from './SettingsPage.styles';
import * as SQLite from 'expo-sqlite';

import { deleteStores } from '../../Utils/SQLConstants';

const db = SQLite.openDatabase("grocerListPlus.db");

const SETTINGS = [
  {
    description: 'Remove All Stores',
    title: 'Remove All Stores',
  }
];

class SettingsPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount = () => {
    console.log('SettingsPage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  // getDerivedStateFromProps = (nextProps, prevState) => {
  //   console.log('SettingsPage getDerivedStateFromProps', nextProps, prevState);
  // }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('SettingsPage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('SettingsPage did update');
  }

  componentWillUnmount = () => {
    console.log('SettingsPage will unmount');
  }

  removeAllStores = () => {
    console.log('Removing all stores')
    db.transaction((tx) => {
      tx.executeSql(deleteStores);
    },
      (error) => console.log(error + '\ntransaction error'),
      () => console.log('successful')
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.SettingsPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <View style={styles.SettingsPageWrapper}>
        <FlatList
          data={SETTINGS}
          renderItem={({ item, index, separators }) => (
            <Card onPress={this.removeAllStores}>
              <Card.Title title={item.title} subtitle={item.description} />
            </Card>
          )}
        />
      </View>
    );
  }
}

SettingsPage.propTypes = {
  // bla: PropTypes.string,
};

SettingsPage.defaultProps = {
  // bla: 'test',
};

export default SettingsPage;
