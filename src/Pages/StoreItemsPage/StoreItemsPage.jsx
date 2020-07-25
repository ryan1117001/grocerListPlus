import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, TextInput, FlatList } from 'react-native';
import {
	Modal, Provider, Portal,
	Button, Dialog, IconButton, Text
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import { navigate } from '../../Utils/RootNavigation';
import {
	db, deleteItem, insertStoreItem,
	updateDateToGo, selectItemsByItemTypeAndStoreId, updateStoreName
} from '../../Utils/SQLConstants';
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import { itemType } from '../../Utils/TypeConstants'
import moment from 'moment'

class StoreItemsPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showDeleteItemConfirmation: false,
			showCalendarModal: false,
			showAddItemModal: false,
			showEditStoreModal: false,
			selectedDate: props.route.params.dateToGo,
			storeName: props.route.params.storeName,
			storeId: props.route.params.storeId,
			itemNameText: '',
			storeNameText: '',
			isRefreshing: false,
			storeItemData: [],
			itemToDelete: ''
		};

		this.setHeader(props.navigation)
	}

	setHeader = (navigation) => {
		navigation.setOptions({
			title: this.state.storeName,
			headerStyle: {
				backgroundColor: '#5C00E7',
			},
			headerTintColor: '#FFF',
			headerRight: () => (
				<View style={styles.HeaderWrapper}>
					<IconButton
						icon='magnify'
						color='#FFF'
						onPress={() => { }}
					/>
					<IconButton
						icon='pencil-outline'
						color='#FFF'
						onPress={this.showEditStoreModal}
					/>
					<IconButton
						icon='dots-vertical'
						color='#FFF'
						onPress={(() => navigate('Settings', {}))}
					/>
				</View>
			)
		})
	}

	componentDidMount = () => {
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.forceRefresh()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	hideCalendarModal = () => {
		this.setState({
			showCalendarModal: false
		})
	}

	showCalendarModal = () => {
		this.setState({
			showCalendarModal: true
		})
	}

	hideAddItemModal = () => {
		this.setState({
			showAddItemModal: false
		})
	}

	showAddItemModal = () => {
		this.setState({
			showAddItemModal: true
		})
	}


	hideEditStoreModal = () => {
		this.setState({
			showEditStoreModal: false
		})
	}

	showEditStoreModal = () => {
		this.setState({
			showEditStoreModal: true
		})
	}

	showDeleteItemConfirmation = (id) => {
		this.setState({
			showDeleteItemConfirmation: true,
			itemToDelete: id
		})
	}


	hideDeleteItemConfirmation = () => {
		this.setState({
			showDeleteItemConfirmation: false,
			itemToDelete: null
		})
	}

	selectDate = (day) => {
		var date = moment(day.dateString)
		db.transaction(tx => {
			console.debug('exec selectDate ' + day.dateString + " " + this.state.storeId)
			tx.executeSql(updateDateToGo,
				[date.format('YYYY-MM-DD'), this.state.storeId],
				() => {
					console.debug('Success')
					this.setState({
						selectedDate: date.locale('en-US').format('l')
					})
				},
				() => console.debug('Error')
			)
		})
		this.hideCalendarModal()
	}

	addItem = () => {
		console.debug('exec addItem')
		if (this.state.itemNameText !== '') {
			db.transaction(tx => {
				tx.executeSql(insertStoreItem,
					[this.state.itemNameText, itemType.STORE, this.state.storeId],
					() => {
						console.debug('Success')
						this.queryAllStoreItems()
						this.hideAddItemModal()
						this.setState({
							itemNameText: ''
						})
					},
					() => console.debug('Error')
				)
			})
		}
	}

	deleteItem = (id) => {
		console.debug('delete item')
		db.transaction(tx => {
			tx.executeSql(
				deleteItem,
				[id],
				() => {
					console.debug('success')
					this.hideDeleteItemConfirmation()
					this.forceRefresh()
				},
				() => console.debug('error')
			)
		})
	}

	queryAllStoreItems = () => {
		console.debug('all unchecked')
		db.transaction(tx => {
			tx.executeSql(
				selectItemsByItemTypeAndStoreId,
				[itemType.STORE, this.state.storeId],
				(_, { rows: { _array } }) => {
					this.setState({
						storeItemData: _array
					})
				},
				() => console.debug('Error')
			)
		})
	}

	forceRefresh = () => {
		this.setState({
			isRefreshing: true
		})
		this.queryAllStoreItems()
		this.setState({
			isRefreshing: false
		})
	}

	editStoreName = () => {
		console.debug('exec editStore')
		db.transaction(tx => {
			tx.executeSql(
				updateStoreName,
				[this.state.storeNameText, this.state.storeId],
				() => {
					console.debug('success')
					this.setState({
						storeName: this.state.storeNameText,
						storeNameText: '',
					})
				},
				() => console.debug('error')
			)
		})
	}

	render() {

		return (
			<Provider>
				{/* Store name and dates */}

				<View style={styles.TitleRowWrapper}>
					<Button
						onPress={this.showAddItemModal}
					>
						Add An Item
           				</Button>
					<Button
						onPress={this.showCalendarModal}
					>
						{this.state.selectedDate}
					</Button>
				</View>
				{/* Showing data */}
				<FlatList
					refreshing={this.state.isRefreshing}
					onRefresh={this.forceRefresh}
					style={styles.StoreItemsPageWrapper}
					data={this.state.storeItemData}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							showDeleteItemConfirmationFunc={this.showDeleteItemConfirmation}
						/>
					)}
				/>


				<Portal>
					<Modal visible={this.state.showCalendarModal} onDismiss={this.hideCalendarModal}>
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
							onMonthChange={(month) => { console.debug('month changed', month) }}
							// If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
							firstDay={1}
							// Hide day names. Default = false
							hideDayNames={false}
							// Show week numbers to the left. Default = false
							showWeekNumbers={false}
							// Handler which gets executed when press arrow icon left. It receive a callback can go back month
							onPressArrowLeft={substractMonth => substractMonth()}
							// Handler which gets executed when press arrow icon right. It receive a callback can go next month
							onPressArrowRight={addMonth => addMonth()}
						/>
					</Modal>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.showAddItemModal}
						onDismiss={this.hideAddItemModal}>
						<Dialog.Title>Add Item</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={'Item Name'}
								onChangeText={text => this.setState({ itemNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideAddItemModal}>Cancel</Button>
							<Button onPress={this.addItem}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
				{/* edit store name */}
				<Portal>
					<Dialog
						visible={this.state.showEditStoreModal}
						onDismiss={this.hideEditStoreModal}>
						<Dialog.Title>Edit Store Name</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={"Store Name"}
								onChangeText={text => this.setState({ storeNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideEditStoreModal}>Cancel</Button>
							<Button onPress={this.editStoreName}>Done</Button>
						</Dialog.Actions>
					</Dialog>

				</Portal>
				{/* delete item confirmation */}
				<Portal>
					<Dialog
						visible={this.state.showDeleteItemConfirmation}
						onDismiss={this.hideDeleteItemConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be part of the store
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideDeleteItemConfirmation}>Cancel</Button>
							<Button onPress={this.deleteItem.bind(this, this.state.itemToDelete)}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			</Provider>

		);
	}
}

StoreItemsPage.propTypes = {
	// bla: PropTypes.string,
	store: PropTypes.object
};

StoreItemsPage.defaultProps = {
	// bla: 'test',
};

export default StoreItemsPage;
