import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, TextInput, FlatList } from 'react-native';
import {
	Modal, Provider, Portal, Snackbar, List, Divider,
	Button, Dialog, IconButton, Text, Searchbar
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import {
	db, deleteItem, insertStoreItem, updateItemType,
	updateDateToGo, selectItemsByItemTypeAndStoreId
} from '../../Utils/SQLConstants';
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import { itemType } from '../../Utils/TypeConstants'
import moment from 'moment'
import { searchByItemName } from '../../Utils/SearchUtil'

class StoreItemsPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			toggleDeleteItemConfirmation: false,
			toggleCalendarModal: false,
			toggleAddItemModal: false,
			toggleEditStoreModal: false,
			selectedDate: props.route.params.dateToGo,
			storeName: props.route.params.storeName,
			storeId: props.route.params.storeId,
			itemNameText: '',
			isRefreshing: false,
			storeItemData: [],
			searchResults: [],
			itemToDelete: '',
			searchText: '',
			toggleSearch: false,
			toggleSnackBar: false,
			snackBarItemId: null
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
						onPress={this.toggleSearchBar}
					/>
					<IconButton
						icon='dots-vertical'
						color='#FFF'
						onPress={(() => navigation.navigate('Settings', {}))}
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

	componentDidUpdate = () => {
		// console.debug('StoreItemsPage did update')
	}

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	toggleCalendarModal = () => {
		this.setState({
			toggleCalendarModal: !this.state.toggleCalendarModal
		})
	}

	toggleAddItemModal = () => {
		this.setState({
			toggleAddItemModal: !this.state.toggleAddItemModal
		})
	}

	toggleDeleteItemConfirmation = (id) => {
		this.setState({
			itemToDelete: id ? id : this.state.itemToDelete,
			toggleDeleteItemConfirmation: !this.state.toggleDeleteItemConfirmation,
		})
	}

	toggleSearchBar = () => {
		this.setState({
			toggleSearch: !this.state.toggleSearch
		})
	}

	toggleSnackBar = (id) => {
		console.debug('ID: ' + id)
		this.setState({
			snackBarItemId: id ? id : this.state.snackBarItemId,
			toggleSnackBar: true
		})
		console.debug('ID: ' + this.state.snackBarItemId)
	}

	toggleExtraOptions = (id) => {
		this.setState({
			extraOptionItemId: id ? id : this.state.extraOptionItemId,
			toggleExtraOptions: !this.state.toggleExtraOptions
		})
	}

	searchForItem = () => {
		const { storeItemData, searchText } = this.state
		this.setState({
			searchResults: searchByItemName(storeItemData, searchText)
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
		this.toggleCalendarModal()
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
						this.toggleAddItemModal()
						this.setState({
							itemNameText: ''
						})
					},
					() => console.debug('Error')
				)
			})
		}
	}

	/**
	 * it will ever only be the undo back to the store item page
	 */
	undoUpdateItemType = () => {
		db.transaction(tx => {
			console.debug('exec changeItemType: ' + this.state.snackBarItemId)
			tx.executeSql(
				updateItemType,
				[itemType.STORE, this.state.snackBarItemId],
				() => console.debug('changeItemType success'),
				() => console.debug('changeItemType error')
			)
		},
			(error) => console.debug(error),
			() => {
				console.debug('transsaction success')
				this.forceRefresh()
				this.setState({
					toggleSnackBar: false
				})
			})
	}

	updateItemType = (args) => {
		db.transaction(tx => {
			console.debug('exec changeItemType: ' + this.state.extraOptionItemId)
			tx.executeSql(
				updateItemType,
				args,
				() => console.debug('changeItemType success'),
				() => console.debug('changeItemType error')
			)
		},
			(error) => console.debug(error),
			() => {
				console.debug('transaction success')
				this.forceRefresh()
				this.toggleExtraOptions()
				this.toggleSnackBar(this.state.extraOptionItemId)
			})
	}

	deleteItem = (id) => {
		console.debug('delete item')
		db.transaction(tx => {
			tx.executeSql(
				deleteItem,
				[id],
				() => {
					console.debug('success')
					this.toggleDeleteItemConfirmation(id)
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

	render() {
		return (
			<Provider>
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForItem}
				/>}
				{/* Store name and dates */}
				<View style={styles.TitleRowWrapper}>
					<Button
						onPress={this.toggleAddItemModal}
					>
						Add An Item
           				</Button>
					<Button
						onPress={this.toggleCalendarModal}
					>
						{this.state.selectedDate}
					</Button>
				</View>
				{/* Showing data */}
				<FlatList
					refreshing={this.state.isRefreshing}
					onRefresh={this.forceRefresh}
					style={styles.StoreItemsPageWrapper}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.storeItemData}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							toggleDeleteItemConfirmationFunc={this.toggleDeleteItemConfirmation}
							toggleSnackBarFunc={this.toggleSnackBar}
							toggleExtraOptionsFunc={this.toggleExtraOptions}
						/>
					)}
				/>
				<Snackbar
					visible={this.state.toggleSnackBar}
					onDismiss={this.toggleSnackBar}
					duration={5000}
					action={{
						label: 'Undo',
						onPress: () => {
							this.undoUpdateItemType()
						}
					}}>
					Switch item back to this store!
      			</Snackbar>

				<Portal>
					<Modal visible={this.state.toggleCalendarModal} onDismiss={this.toggleCalendarModal}>
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
						visible={this.state.toggleAddItemModal}
						onDismiss={this.toggleAddItemModal}>
						<Dialog.Title>Add Item</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={'Item Name'}
								onChangeText={text => this.setState({ itemNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleAddItemModal}>Cancel</Button>
							<Button onPress={this.addItem}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
				
				{/* delete item confirmation */}
				<Portal>
					<Dialog
						visible={this.state.toggleDeleteItemConfirmation}
						onDismiss={this.toggleDeleteItemConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be part of the store
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleDeleteItemConfirmation}>Cancel</Button>
							<Button onPress={this.deleteItem.bind(this, this.state.itemToDelete)}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.toggleExtraOptions}
						onDismiss={this.toggleExtraOptions}>
						<Dialog.Title>Extra Options</Dialog.Title>
						<Dialog.Content>
							<List.Item
								title={'Move To Inventory'}
								onPress={() => {
									this.updateItemType([itemType.INVENTORY, this.state.extraOptionItemId])
								}}
							/>
							<Divider />
							<List.Item
								title={'Move to Archive'}
								onPress={() => {
									this.updateItemType([itemType.ARCHIVE, this.state.extraOptionItemId])
								}}
							/>
						</Dialog.Content>
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
