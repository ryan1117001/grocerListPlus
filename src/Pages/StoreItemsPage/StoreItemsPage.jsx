import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import {
	List, Modal, Provider, Portal,
	Button, Dialog, Checkbox, IconButton, Surface
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import { navigate } from '../../Utils/RootNavigation';
import {
	db, deleteItem, insertItem, updateItemType,
	updateDateToGo, selectItemsByItemTypeAndStoreId, updateStoreName,
	updatePurchaseDate
} from '../../Utils/SQLConstants';
import { itemType } from '../../Utils/TypeConstants'
import moment from 'moment'

class StoreItemsPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showCalendarModal: false,
			showAddItemModal: false,
			showEditStoreModal: false,
			selectedDate: props.route.params.dateToGo,
			storeName: props.route.params.storeName,
			storeId: props.route.params.storeId,
			itemNameText: '',
			storeNameText: '',
			isRefreshing: false,
			storeItemData: []
		};

		this.setHeader(props.navigation)
	}

	setHeader = (navigation) => {
		navigation.setOptions({
			title: this.state.storeName,
			headerRight: () => (
				<View style={styles.HeaderWrapper}>
					<IconButton
						icon='magnify'
						onPress={() => { }}
					/>
					<IconButton
						icon='pencil-outline' 
						onPress={this.showEditStoreModal}
					/>
					<IconButton
						icon='dots-vertical'
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
		if (this.state.itemNameText !== '') {
			db.transaction(tx => {
				tx.executeSql(insertItem,
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
					this.forceRefresh()
				},
				() => console.debug('error')
			)
		})
	}

	changeItemType = (args) => {
		var date = moment(new Date()).format('YYYY-MM-DD')
		db.transaction(tx => {
			console.debug('exec changeItemType')
			console.debug(args)
			tx.executeSql(
				updateItemType,
				args,
				() => console.debug('changeItemType success'),
				() => console.debug('changeItemType error')
			)
			console.debug('exec updatePurchaseDate')
			console.debug([date, args[1]])
			tx.executeSql(
				updatePurchaseDate,
				[date, args[1]],
				() => console.debug('updatePurchaseDate success'),
				() => console.debug('updatePurchaseDate error')
			)
		},
			() => console.debug('error'),
			() => {
				this.forceRefresh()
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


	renderItems = (data) => {
		if (data.length > 0) {
			return (
				data.map((item) => {
					return (
						<Surface
							style={styles.Surface}
							key={item.id}
						>
							<List.Item
								left={() => <Checkbox.Item
									label=''
									status={item.itemType === itemType.STORE ? 'unchecked' : 'checked'}
									onPress={this.changeItemType.bind(this, [itemType.INVENTORY, item.id])}
								/>}
								right={() =>
									<Button onPress={this.deleteItem.bind(this, item.id)}>
										Delete
                					</Button>
								}
								title={item.itemName}
								key={item.id}
							/>
						</Surface>
					)
				})
			)
		}
		else {
			return <View />
		}
	}

	render() {

		const storeItemList = this.renderItems(this.state.storeItemData)

		return (
			<Provider>
				<ScrollView
					style={styles.StoreItemsPageWrapper}
					refreshControl={
						<RefreshControl
							refreshing={this.state.isRefreshing}
							onRefresh={this.forceRefresh}
						/>
					}
					style={styles.StoreItemsPageWrapper}
				>
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
					<List.Section>
						{storeItemList}

					</List.Section>


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
				</ScrollView>
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
