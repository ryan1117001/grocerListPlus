import React, { PureComponent } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './CheckBoxTextInputRowComponent.styles';
import { List, Card, Checkbox } from 'react-native-paper';
//import { CheckBoxTextInputRowComponentWrapper } from './CheckBoxTextInputRowComponent.styles';

class CheckBoxTextInputRowComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      checked: false,
      value: props.id,
    };
  }

  componentDidMount = () => {
    console.log('CheckBoxTextInputRowComponent mounted');
  }

  static getDerivedStateFromError(error) {
    // getDerivedStateFromError -> Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
  }

  getDerivedStateFromProps = (nextProps, prevState) => {
    console.log('CheckBoxTextInputRowComponent getDerivedStateFromProps', nextProps, prevState);
  }

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    console.log('CheckBoxTextInputRowComponent getSnapshotBeforeUpdate', prevProps, prevState);
  }

  componentDidUpdate = () => {
    console.log('CheckBoxTextInputRowComponent did update');
  }

  componentWillUnmount = () => {
    console.log('CheckBoxTextInputRowComponent will unmount');
  }

  render() {
    return (
      <View style={styles.CheckBoxTextInputRowComponentWrapper} >
        <View style={styles.CheckBoxTextWrapper}>
          <Checkbox
            status={this.state.checked ? 'checked' : 'unchecked'}
            onPress={() => this.setState({ checked: !this.state.checked })}
          />
          <TextInput
            placeholder={"Temporary Text"}
            onChangeText={text => this.setState({ value: text })}
          />
        </View>
        <TouchableOpacity
          onPress={() => console.log('Press Icon')}
        >
          <Text> Icon </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

CheckBoxTextInputRowComponent.propTypes = {
  // bla: PropTypes.string,
};

CheckBoxTextInputRowComponent.defaultProps = {
  // bla: 'test',
};

export default CheckBoxTextInputRowComponent;
