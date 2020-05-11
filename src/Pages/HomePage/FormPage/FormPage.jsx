import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from './FormPage.styles';
//import { FormPageWrapper } from './FormPage.styles';

class FormPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
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

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.FormPageWrapper}>
          <Text>Something went wrong.</Text>
        </View>
      );
    }
    return (
      <View style={styles.FormPageWrapper}>
        <Text>Form Page</Text>
      </View>
    );
  }
}

FormPage.propTypes = {
  // bla: PropTypes.string,
};

FormPage.defaultProps = {
  // bla: 'test',
};

export default FormPage;
