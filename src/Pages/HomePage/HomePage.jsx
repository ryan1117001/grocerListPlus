import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './HomePage.styles';
import { FAB } from 'react-native-paper';

//import { HomePageWrapper } from './HomePage.styles';

class HomePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  componentDidMount = () => {
    console.log('HomePage mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  // static getDerivedStateFromProps = (nextProps, prevState) => {
  //   console.log('HomePage getDerivedStateFromProps', nextProps, prevState);
  // }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('HomePage getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('HomePage did update');
  }

  componentWillUnmount = () => {
    console.log('HomePage will unmount');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.HomePageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <View style={styles.HomePageWrapper}>
        <Text>List Page</Text>
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

HomePage.propTypes = {
  // bla: PropTypes.string,
};

HomePage.defaultProps = {
  // bla: 'test',
};

export default HomePage;
