import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './FormPage.styles';

import { View, Text, ScrollView, TextInput, FlatList } from 'react-native';
import { List, Card, Modal, Provider, Portal, Button } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

import CheckBoxTextInputRowComponent from '../../Components/CheckBoxTextInputRowComponent/CheckBoxTextInputRowComponent';

class FormPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      showCalanderModal: false,
      selectedDate: new Date().toLocaleDateString('en-US', 'GMT'),
      storeName: props.route.params.storeName,
      storeId: props.route.params.storeId
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

  hideModal = () => {
    this.setState({
      showCalenderModal: false
    })
  }

  showModal = () => {
    this.setState({
      showCalenderModal: true
    })
  }

  selectDate = (day) => {
    var date = new Date(Date.UTC(day.year,day.month - 1 ,day.day + 1))
    console.log(date.toLocaleDateString)
    this.setState({
      selectedDate: date.toLocaleDateString()
    })
    this.hideModal()
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
      <Provider>
        <ScrollView style={styles.FormPageWrapper}>
          {/* Store name and dates */}

          <View style={styles.TitleRowWrapper}>
            <Text>
              {this.state.storeName}
            </Text>
            
            <Button
              onPress={this.showModal}
            >
              {this.state.selectedDate}
            </Button>
          </View>
          {/* Showing data */}
          <FlatList
            data={this.state.data}
            renderItem={({ item, index, separators }) => (
              <Card>
                <Card.Title title={item.storeName} subtitle={item.id} />
                <Card.Actions>
                  <Button > OK </Button>
                  <Button > Delete </Button>
                </Card.Actions>
              </Card>
            )}
          />
          {/* Checked off stuff */}
          <List.Section>
            <List.Accordion
              title="Deleted Stuff"
              left={props => <List.Icon {...props} icon="folder" />}
            >

            </List.Accordion>
          </List.Section>
          <Portal>
            <Modal visible={this.state.showCalenderModal} onDismiss={this.hideModal}>
              <Calendar
                style={styles.CalendarWrapper}
                theme={{
                  selectedDayBackgroundColor: '#00adf5',
                  todayTextColor: '#00adf5'
                }}
                // Handler which gets executed on day press. Default = undefined
                onDayPress={this.selectDate}
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'MMM yyyy'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => { console.log('month changed', month) }}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={true}
                // Show week numbers to the left. Default = false
                showWeekNumbers={true}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                onPressArrowLeft={substractMonth => substractMonth()}
                // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                onPressArrowRight={addMonth => addMonth()}
              />
            </Modal>
          </Portal>
        </ScrollView>
      </Provider>

    );
  }
}

FormPage.propTypes = {
  // bla: PropTypes.string,
  store: PropTypes.object
};

FormPage.defaultProps = {
  // bla: 'test',
};

export default FormPage;
