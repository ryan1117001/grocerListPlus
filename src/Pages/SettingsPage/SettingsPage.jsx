import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { Card } from 'react-native-paper';
import * as styles from './SettingsPage.styles';
//import { SettingsPageWrapper } from './SettingsPage.styles';

const SETTINGS = [
  {
    description: 'Description 1',
    title: 'First Setting',
  },
  {
    description: 'description 2',
    title: 'Second Setting',
  },
  {
    description: 'description 3',
    title: 'Third Setting',
  },
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

  render () {
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
            <Card>
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
