import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './FormPage.styles';

import { View, Text, ScrollView, TextInput, FlatList, TouchableOpacity, } from 'react-native';
import { List, Card, Checkbox, Modal, Provider, Portal, Button } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

import CheckBoxTextInputRowComponent from './CheckBoxTextInputRowComponent/CheckBoxTextInputRowComponent';

//import { FormPageWrapper } from './FormPage.styles';


const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Form',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Form',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Form',
  },
];

const DATA2 = [
  {
    id: '2354132',
    title: 'Deleted'
  }
]

class FormPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      showCalanderModal: false,
      selectedDate: new Date().toLocaleDateString()
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

    const date = new Date(day.dateString)
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
            <TextInput
              placeholder={"Temporary Text"}
              onChangeText={text => this.setState({ value: text })}
            />
            <Button
              onPress={this.showModal}
            >
              {this.state.selectedDate}
            </Button>
          </View>
          {/* Showing data */}
          {DATA.map((item) =>
            <CheckBoxTextInputRowComponent
              id={item.id}
              title={item.title}
            />
          )}
          {/* New data to be added */}
          <View style={styles.UserInputWrapper} >
            <Checkbox
              status={this.state.checked ? 'checked' : 'unchecked'}
              onPress={() => this.setState({ checked: !this.state.checked })}
            />
            <TextInput
              placeholder={"Temporary Text"}
              onChangeText={text => this.setState({ value: text })}
            />
          </View>

          {/* Checked off stuff */}
          <List.Section>
            <List.Accordion
              title="Deleted Stuff"
              left={props => <List.Icon {...props} icon="folder" />}
            >
              {DATA2.map((item) =>
                <CheckBoxTextInputRowComponent
                  id={item.id}
                  title={item.title}
                />
              )}
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
};

FormPage.defaultProps = {
  // bla: 'test',
};

export default FormPage;
