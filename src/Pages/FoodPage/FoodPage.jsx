import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './FoodPage.styles';

import {FAB} from 'react-native-paper'
//import { FoodPageWrapper } from './FoodPage.styles';

class FoodPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount = () => {
    console.log('FoodPage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  // getDerivedStateFromProps = (nextProps, prevState) => {
  //   console.log('FoodPage getDerivedStateFromProps', nextProps, prevState);
  // }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('FoodPage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('FoodPage did update');
  }

  componentWillUnmount = () => {
    console.log('FoodPage will unmount');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.FoodPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <View style={styles.FoodPageWrapper}>
        <Text>Food Page</Text>
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() => console.log('Pressed')}
        />
      </View>
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
