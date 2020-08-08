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
	updateDateToGo, selectItemsByItemTypeAndStoreId,
	selectAllItemJoinedStoresByItemType
} from '../../Utils/SQLConstants';
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import { itemType, storeType } from '../../Utils/TypeConstants'
import moment from 'moment'
import { searchByItemName } from '../../Utils/SearchUtil'
import { isUndefined } from 'lodash';

class StoreItemsPage extends PureComponent {
	constructor(props) {
		super(props);

		const { params } = props.route

		var dateToGo = null, storeId = null, storeName = null
		if (!isUndefined(params)) {
			dateToGo = params.dateToGo
			storeId = params.storeId
			storeName = params.storeName
		}

		this.state = {
			// Data
			storeItemData: [],
			searchResults: [],
			stores: [],

			// Text changes
			searchText: '',
			itemNameText: '',

			// Toggle
			toggleAddItemModal: false,
			toggleAddInventoryItemModal: false,
			toggleCalendarModal: false,
			toggleDeleteItemConfirmation: false,
			toggleEditStoreModal: false,
			toggleExtraOptions: false,
			toggleRefreshing: false,
			toggleSearch: false,
			toggleSnackBar: false,

			// Store related items
			selectedDate: dateToGo,
			storeId: storeId,
			storePickerId: 0,

			//Store Ids to perform actions tp
			itemIdToDelete: null,
			itemIdForSnackBar: null,
			itemIdForExtraOptions: null,
			itemTypeForExtraOptions: null,

			// Nav Settings
			pageTitle: this.setPageTitle(storeName),
		};

		this.setHeader(props.navigation)
	}

	setPageTitle = (storeName) => {
		const { route } = this.props
		switch (route.name) {
			case 'StoreItems':
				return storeName
			case 'InventoryItems':
				return 'Inventory'
			case 'ArchiveItems':
				return 'Archive'
			default:
				return ''
		}
	}

	/**
	 * 
	 * @param {*} navigation 
	 */
	setHeader = (navigation) => {
		navigation.setOptions({
			title: this.state.pageTitle,
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

	/**
	 * 
	 * @param {*} navigation 
	 */
	setTabHeader = (navigation) => {
		navigation.setOptions({
			title: 'Items'
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
		if (this.props.route.name === 'ArchiveItems') {
			this.setTabHeader(this.props.route.params.stackNavigation)
		}
	}

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	/**
	 * 
	 */
	toggleAddItemModal = () => {
		this.setState({
			toggleAddItemModal: !this.state.toggleAddItemModal
		})
	}

	/**
	 * 
	 */
	toggleCalendarModal = () => {
		this.setState({
			toggleCalendarModal: !this.state.toggleCalendarModal
		})
	}

	/**
	 * 
	 * @param {*} id 
	 */
	toggleDeleteItemConfirmation = (id) => {
		this.setState({
			itemIdToDelete: id ? id : this.state.itemIdToDelete,
			toggleDeleteItemConfirmation: !this.state.toggleDeleteItemConfirmation,
		})
	}

	/**
	 * 
	 * @param {*} id 
	 */
	toggleExtraOptions = (id, itemType) => {
		this.setState({
			itemIdForExtraOptions: id ? id : this.state.itemIdForExtraOptions,
			itemTypeForExtraOptions: itemType ? itemType : this.state.itemTypeForExtraOptions,
			toggleExtraOptions: !this.state.toggleExtraOptions
		})
	}

	/**
	 * 
	 */
	toggleSearchBar = () => {
		this.setState({
			toggleSearch: !this.state.toggleSearch
		})
	}

	/**
	 * 
	 * @param {*} id 
	 */
	toggleSnackBar = (id) => {
		console.debug('ID: ' + id)
		this.setState({
			itemIdForSnackBar: id ? id : this.state.itemIdForSnackBar,
			toggleSnackBar: true
		})
		console.debug('ID: ' + this.state.itemIdForSnackBar)
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
			console.debug('exec changeItemType: ' + this.state.itemIdForSnackBar)
			tx.executeSql(
				updateItemType,
				[itemType.STORE, this.state.itemIdForSnackBar],
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
			console.debug('exec changeItemType: ' + this.state.itemIdForExtraOptions)
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
				this.toggleSnackBar(this.state.itemIdForExtraOptions)
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
				(error) => console.debug(error)
			)
		})
	}

	queryAllStoreItems = () => {
		console.debug('exec selectItemsByItemTypeAndStoreId')
		db.transaction(tx => {
			tx.executeSql(
				selectItemsByItemTypeAndStoreId,
				[itemType.STORE, this.state.storeId],
				(_, { rows: { _array } }) => {
					this.setState({
						storeItemData: _array
					})
				},
				(error) => console.debug(error)
			)
		},
			(error) => console.debug(error))
	}

	querySelectAllItemJoinedStoresByItemType = (args) => {
		console.debug('exec selectAllItemJoinedStoresByItemType')
		db.transaction(tx => {
			tx.executeSql(
				selectAllItemJoinedStoresByItemType,
				args,
				(_, { rows: { _array } }) => {
					this.setState({
						storeItemData: _array
					})
				},
				(error) => console.debug(error)
			)
		})
	}

	forceRefresh = () => {
		const { route } = this.props
		this.setState({
			toggleRefreshing: true
		})
		switch (route.name) {
			case 'StoreItems':
				this.queryAllStoreItems()
				break;
			case 'InventoryItems':
				this.querySelectAllItemJoinedStoresByItemType([itemType.INVENTORY])
				break;
			case 'ArchiveItems':
				this.querySelectAllItemJoinedStoresByItemType([itemType.ARCHIVE])
				break;
			default:
				break;
		}

		this.setState({
			toggleRefreshing: false
		})
	}

	render() {

		const { route } = this.props
		return (
			<Provider>
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForItem}
				/>}
				{/* Store name and dates */}
				{route.name === 'StoreItems' && <View style={styles.TitleRowWrapper}>
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
				</View>}
				{/* Showing data */}
				<FlatList
					refreshing={this.state.toggleRefreshing}
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
					duration={Snackbar.DURATION_SHORT}
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
							<Button onPress={this.deleteItem.bind(this, this.state.itemIdToDelete)}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.toggleExtraOptions}
						onDismiss={this.toggleExtraOptions}>
						<Dialog.Title>Extra Options</Dialog.Title>
						<Dialog.Content>
							{this.state.itemType !== storeType.INUSE && <List.Item
								title={'Move To Inventory'}
								onPress={() => {
									this.updateItemType([itemType.STORE, this.state.itemIdForExtraOptions])
								}}
							/>}
							<Divider />
							{<List.Item
								title={'Move To Inventory'}
								onPress={() => {
									this.updateItemType([itemType.INVENTORY, this.state.itemIdForExtraOptions])
								}}
							/>}
							<Divider />
							{<List.Item
								title={'Move to Archive'}
								onPress={() => {
									this.updateItemType([itemType.ARCHIVE, this.state.itemIdForExtraOptions])
								}}
							/>}
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
