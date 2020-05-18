import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './HomePage.styles';
import { FAB, Card } from 'react-native-paper';
import { navigate} from '../../Utils/RootNavigation';

//import { HomePageWrapper } from './HomePage.styles';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

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

  navigateToForm = () => {
    console.log("Navigate to Form")
    navigate('Forms',null)
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
        <FlatList
          data={DATA}
          renderItem={({ item, index, separators }) => (
            <Card 
              onPress={this.navigateToForm}
            >
              <Card.Title title={item.title} subtitle={item.id} />
            </Card>
          )}
        />
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={this.navigateToForm}
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
