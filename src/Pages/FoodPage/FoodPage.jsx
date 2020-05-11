import React, { PureComponent } from 'react';
import { View, Text, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './FoodPage.styles';

import { FAB, Card, Portal, Modal, Provider, Button, Paragraph } from 'react-native-paper'
//import { FoodPageWrapper } from './FoodPage.styles';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Food',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Food',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Food',
  },
];

class FoodPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      showAddFoodModal: false
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

  hideModal = () => {
    this.setState({
      showAddFoodModal: false
    })
  }

  showModal = () => {
    console.log("Show modal")
    this.setState({
      showAddFoodModal: true
    })
  }

  addToFridge = () => {
    this.hideModal()
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
        <Provider>
          <FlatList
            data={DATA}
            renderItem={({ item, index, separators }) => (
              <Card >
                <Card.Title title={item.title} subtitle={item.id} />
              </Card>
            )}
          // extraData=
          />
          <Portal>
            <Modal visible={this.state.showAddFoodModal} onDismiss={this.hideModal}>
              <Card>
                <Card.Title title={"Add An Item To Your Fridge!"} />
                <Card.Content>
                    <Text> Fill out form</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={this.hideModal}> Close </Button>
                  <Button onPress={this.addToFridge}>OK</Button>
                </Card.Actions>
              </Card>
            </Modal>
          </Portal>
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={this.showModal}
          />
        </Provider>
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
