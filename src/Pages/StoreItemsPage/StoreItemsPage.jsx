import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './StoreItemsPage.styles'
import { View, FlatList, TextInput } from 'react-native';
import { Picker } from '@react-native-community/picker'
import {
	Modal, Provider, Portal, Snackbar, List, Divider,
	Button, Dialog, IconButton, Text, Searchbar
} from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import {
	db, deleteItem, insertStoreItem, updateItemType,
	updateDateToGo, selectItemsByItemTypeAndStoreId,
	selectAllItemJoinedStoresByItemType,
	selectAllStores,
	updateItemAttributes,
	retrieveUnits,
	retrieveCategories
} from '../../Utils/SQLConstants';
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import { itemType, selectDateType, storeType } from '../../Utils/TypeConstants'
import moment from 'moment'
import { searchByItemName } from '../../Utils/SearchUtil'
import { isUndefined, isNull, isEmpty } from 'lodash';

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
			units: [],
			categories: [],

			// Info changes
			searchText: '',
			selectedDate: moment(new Date()).locale('en-US').format('l'),
			selectDateComponentUser: '',

			// Add / Edit Items
			amountText: '',
			itemNameText: '',
			itemPriceText: '',
			storePickerId: 0,
			unitPickerId: 0,
			categoriesPickerId: 0,
			itemQuantityCounter: 1,
			experationDate: moment(new Date()).locale('en-US').format('l'),
			purchaseDate: moment(new Date()).locale('en-US').format('l'),
			archiveDate: moment(new Date()).locale('en-US').format('l'),

			// Toggle
			toggleAddItemModal: false,
			toggleAddInventoryItemModal: false,
			toggleCalendarModal: false,
			toggleDeleteItemConfirmation: false,
			toggleEditStoreModal: false,
			toggleEditItemModal: false,
			toggleExtraOptions: false,
			toggleRefreshing: false,
			toggleSearch: false,
			toggleSnackBar: false,

			// Store related store

			dateToGo: dateToGo,
			storeId: storeId,

			//Items Ids to perform actions to
			itemIdToDelete: null,
			itemIdToEdit: null,
			itemIdForSnackBar: null,
			itemIdForExtraOptions: null,
			itemTypeForExtraOptions: null,

			// Nav Settings
			pageTitle: this.setPageTitle(storeName),
		};
		if (this.props.route.name !== 'ArchiveItems') {
			this.setHeader(props.navigation)
		}
	}

	setPageTitle = (storeName) => {
		const { route } = this.props
		switch (route.name) {
			case 'StoreItems':
				return storeName
			case 'ArchiveStoreItems':
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
		const { route } = this.props
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
					{!isEmpty(this.state.stores) &&
						(route.name === 'InventoryItems' || route.name === 'ArchiveItems') &&
						<IconButton
							icon='plus'
							color='#FFF'
							onPress={this.toggleAddItemModal}
						/>}
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
		if (this.props.route.name === 'ArchiveItems') {
			this.setHeader(this.props.route.params.stackNavigation)
		}
		else if (this.props.route.name === 'InventoryItems') {
			this.setHeader(this.props.navigation)
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
	toggleEditItemModal = (item) => {
		if (!this.state.toggleEditItemModal) {
			this.setState({
				itemIdToEdit: item.itemId ? item.itemId : null,
				itemNameText: item.itemName ? item.itemName : '',
				itemPriceText: item ? item.priceAmount : '',
				amountText: item ? item.amountOfUnit : '',
				experationDate: item || !isNull(item.experationDate) ? item.expirationDate : moment(new Date()).locale('en-US').format('l'),
				purchaseDate: item || !isNull(item.purchaseDate) ? item.purchaseDate : moment(new Date()).locale('en-US').format('l'),
				archiveDate: item || !isNull(item.archiveDate) ? item.archiveDate : moment(new Date()).locale('en-US').format('l'),
				categoriesPickerId: item ? item.categoryId : 0,
				unitPickerId: item ? item.unitId : 0,
				itemQuantityCounter: item.quantity ? item.quantity : 1,
				toggleEditItemModal: !this.state.toggleEditItemModal
			})
		}
		else {
			this.setState({
				toggleEditItemModal: !this.state.toggleEditItemModal
			})
			this.clearInputs()
		}
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
		this.setState({
			itemIdForSnackBar: id ? id : this.state.itemIdForSnackBar,
			toggleSnackBar: true
		})
	}

	/**
	 * 
	 */
	searchForItem = () => {
		const { storeItemData, searchText } = this.state
		this.setState({
			searchResults: searchByItemName(storeItemData, searchText)
		})
	}

	itemQuantityCounterMinus = () => {
		if (this.state.itemQuantityCounter > 1) {
			this.setState({
				itemQuantityCounter: this.state.itemQuantityCounter - 1
			})
		}
	}

	itemQuantityCounterPlus = () => {
		this.setState({
			itemQuantityCounter: this.state.itemQuantityCounter + 1
		})
	}

	/**
	 * 
	 * @param {*} day 
	 */
	selectDate = (day) => {
		var date = moment(day.dateString)
		db.transaction(tx => {
			console.debug('exec selectDate ' + day.dateString + " " + this.state.storeId)
			if (this.state.toggleAddItemModal || this.state.toggleEditItemModal) {
				switch (this.state.selectDateComponentUser) {
					case selectDateType.EXPIRATION:
						this.setState({
							experationDate: date.locale('en-US').format('l')
						})
						break;
					case selectDateType.PURCHASE:
						this.setState({
							purchaseDate: date.locale('en-US').format('l')
						})
						break;
					case selectDateType.ARCHIVE:
						this.setState({
							archiveDate: date.locale('en-US').format('l')
						})
						break;
					default:
						break;
				}
			}
			else {
				tx.executeSql(updateDateToGo,
					[date.format('YYYY-MM-DD'), this.state.storeId],
					() => {
						console.debug('Success')
						this.setState({
							dateToGo: date.locale('en-US').format('l')
						})
					},
					() => console.debug('Error')
				)
			}
		})
		this.toggleCalendarModal()
	}

	/**
	 * 
	 * 
	 */
	addAndEditItem = () => {
		console.debug('exec addAndEditItem')
		if (this.state.itemNameText !== '') {

			var itemTypeArg = null, storeId = null
			switch (this.props.route.name) {
				case 'StoreItems':
					itemTypeArg = itemType.STORE
					storeId = this.state.storeId
					break;
				case 'InventoryItems':
					itemTypeArg = itemType.INVENTORY
					storeId = this.state.storePickerId
					break;
				case 'ArchiveItems':
					itemTypeArg = itemType.ARCHIVE
					storeId = this.state.storePickerId
					break;
			}

			db.transaction(tx => {
				if (this.state.toggleAddItemModal) {
					tx.executeSql(insertStoreItem,
						[
							this.state.itemNameText, itemTypeArg, storeId,
							this.state.categoriesPickerId, this.state.unitPickerId, this.state.experationDate,
							this.state.itemQuantityCounter, this.state.amountText, this.state.itemPriceText,
							this.state.purchaseDate, this.state.archiveDate
						],
						() => {
							console.debug('Success')

							this.toggleAddItemModal()

						},
						(error) => console.debug(error)
					)
				}
				else if (this.state.toggleEditItemModal) {
					tx.executeSql(
						updateItemAttributes,
						[
							this.state.itemNameText, this.state.categoriesPickerId,
							this.state.unitPickerId, this.state.experationDate, this.state.itemQuantityCounter,
							this.state.amountText, this.state.itemPriceText, this.state.purchaseDate,
							this.state.archiveDate, this.state.itemIdToEdit
						],
						() => {
							this.toggleEditItemModal()
						},
						(error) => { console.debug(error) }
					)
				}
			},
				(error) => {
					console.debug(error)
					this.clearInputs()
				},
				() => {
					this.forceRefresh()
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

	/**
	 * 
	 * @param {*} args 
	 */
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

	/**
	 * 
	 * @param {*} id 
	 */
	deleteItem = (id) => {
		console.debug('delete item')
		db.transaction(tx => {
			tx.executeSql(
				deleteItem,
				[id],
				() => {
					this.toggleDeleteItemConfirmation(id)
					this.forceRefresh()
				},
				(error) => console.debug(error)
			)
		})
	}

	/**
	 * 
	 */
	queryAllStoreItems = (args) => {
		console.debug('exec selectItemsByItemTypeAndStoreId')
		db.transaction(tx => {
			tx.executeSql(
				selectItemsByItemTypeAndStoreId,
				[args, this.state.storeId],
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

	/**
	 * 
	 * @param {*} args 
	 */
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

	/**
	 * 
	 */
	queryAllStores() {
		console.debug('exec selectAllStores')
		db.transaction(tx => {
			tx.executeSql(
				selectAllStores,
				[],
				(_, { rows: { _array } }) => {
					if (_array.length > 0) {
						this.setState({
							stores: _array,
							storePickerId: _array[0].id
						})
					}
				},
				(error) => console.debug(error)
			)
		})
	}

	/**
	 * 
	 */
	queryAllUnits() {
		db.transaction(tx => {
			tx.executeSql(
				retrieveUnits,
				[],
				(_, { rows: { _array } }) => {
					if (_array.length > 0) {
						this.setState({
							units: _array,
							unitPickerId: _array[0].id
						})
					}
				},
				(error) => console.debug(error)
			)
		})
	}

	/**
	 * 
	 */
	queryAllCategories() {
		db.transaction(tx => {
			tx.executeSql(retrieveCategories,
				[],
				(_, { rows: { _array } }) => {
					if (_array.length > 0) {
						this.setState({
							categories: _array,
							categoriesPickerId: _array[0].id
						})
					}
				},
				(error) => console.debug(error)
			)
		})
	}

	/**
	 * 
	 */
	forceRefresh = () => {
		const { route } = this.props
		this.setState({
			toggleRefreshing: true
		})
		switch (route.name) {
			case 'StoreItems':
				this.queryAllStoreItems(storeType.INUSE)
				break;
			case 'ArchiveStoreItems':
				this.queryAllStoreItems(storeType.ARCHIVE)
				break;
			case 'InventoryItems':
				this.querySelectAllItemJoinedStoresByItemType([itemType.INVENTORY])
				this.queryAllStores()
				break;
			case 'ArchiveItems':
				this.querySelectAllItemJoinedStoresByItemType([itemType.ARCHIVE])
				this.queryAllStores()
				break;
			default:
				break;
		}
		this.queryAllCategories()
		this.queryAllUnits()
		this.clearInputs()
		this.setState({
			toggleRefreshing: false
		})
	}

	clearInputs = () => {
		this.setState({
			itemNameText: '',
			itemPriceText: '',
			amountText: '',
			experationDate: moment(new Date()).locale('en-US').format('l'),
			purchaseDate: moment(new Date()).locale('en-US').format('l'),
			archiveDate: moment(new Date()).locale('en-US').format('l'),
			categoriesPickerId: 0,
			unitPickerId: 0,
			itemQuantityCounter: 1
		})
	}

	/**
	 * 
	 */
	renderStorePickerItems = () => {
		if (this.state.stores.length > 0) {
			return (
				this.state.stores.map((item) => {
					return (
						<Picker.Item key={item.id} label={item.storeName} value={item.id} />
					)
				})
			)
		}
	}

	/**
	 * 
	 */
	renderUnitPickerItems = () => {
		if (this.state.units.length > 0) {
			return (
				this.state.units.map((item) => {
					return (
						<Picker.Item key={item.id} label={item.unitName} value={item.id} />
					)
				})
			)
		}
	}

	/**
	 * 
	 */
	renderCategoriesPickerItems = () => {
		if (this.state.categories.length > 0) {
			return (
				this.state.categories.map((item) => {
					return (
						<Picker.Item key={item.id} label={item.category + ": " + item.subCategory} value={item.id} />
					)
				})
			)
		}
	}

	/**
	 * 
	 */
	render() {
		const { route } = this.props
		const StorePickerValueList = this.renderStorePickerItems()
		const UnitPickerValueList = this.renderUnitPickerItems()
		const CategoryPickerValueList = this.renderCategoriesPickerItems()

		return (
			<Provider
				styles={styles.StoreItemsPageWrapper}
			>
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForItem}
				/>}
				{/* Store name and dates */}
				{(route.name === 'StoreItems' || route.name === 'ArchiveStoreItems') && <View style={styles.TitleRowWrapper}>
					<Button
						onPress={this.toggleAddItemModal}
					>
						Add An Item
           				</Button>
					{route.name === 'StoreItems' && <Button
						onPress={this.toggleCalendarModal}
					>
						Going on: {this.state.dateToGo}
					</Button>}
				</View>}
				{/* Showing data */}
				<FlatList
					refreshing={this.state.toggleRefreshing}
					onRefresh={this.forceRefresh}
					style={styles.FlatListWrapper}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.storeItemData}
					keyExtractor={(item) => item.itemId.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							toggleDeleteItemConfirmationFunc={this.toggleDeleteItemConfirmation}
							toggleSnackBarFunc={this.toggleSnackBar}
							toggleExtraOptionsFunc={this.toggleExtraOptions}
							toggleEditItemModalFunc={this.toggleEditItemModal}
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
					<Dialog
						visible={this.state.toggleAddInventoryItemModal}
						onDismiss={this.toggleAddInventoryItemModal}>
						<Dialog.ScrollArea>
							<Dialog.Title> Add Inventory Item </Dialog.Title>
							<Dialog.Content>
								<Divider />
								<TextInput
									style={styles.dialogTextInput}
									mode='outlined'
									placeholder={'Name'}
									onChangeText={text => this.setState({ itemNameText: text })}
								/>
								<Divider />
								<View>
									<Text> Stores </Text>
									<Picker
										selectedValue={this.state.storePickerId}
										onValueChange={(itemValue, itemIndex) => {
											this.setState({ storePickerId: itemValue })
										}
										}
										mode='dropdown'
									>
										{StorePickerValueList}
									</Picker>
								</View>
								<Divider />
							</Dialog.Content>
							<Dialog.Actions>
								<Button onPress={this.toggleAddInventoryItemModal}>Cancel</Button>
								<Button onPress={this.addInventoryItem}>Done</Button>
							</Dialog.Actions>
						</Dialog.ScrollArea>
					</Dialog>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.toggleAddItemModal || this.state.toggleEditItemModal}
						onDismiss={this.state.toggleAddItemModal ? this.toggleAddItemModal : this.toggleEditItemModal}>
						<Dialog.Title>{this.state.toggleAddItemModal ? 'Add Item' : 'Item Details'}</Dialog.Title>
						<Dialog.Content>
							<Divider />
							<Button
								onPress={() => {
									this.toggleCalendarModal()
									this.setState({
										selectDateComponentUser: selectDateType.EXPIRATION
									})
								}}
							>
								Expires on {this.state.experationDate}
							</Button>
							{(this.props.route.name === "InventoryItems" || this.props.route.name === "ArchiveItems") && <View>
								<Divider />
								<Button
									onPress={() => {
										this.toggleCalendarModal()
										this.setState({
											selectDateComponentUser: selectDateType.PURCHASE
										})
									}}
								>
									Purchased on {this.state.purchaseDate}
								</Button>
								<Divider />
							</View>}
							{this.props.route.name === "ArchiveItems" && <View>
								<Button
									onPress={() => {
										this.toggleCalendarModal()
										this.setState({
											selectDateComponentUser: selectDateType.ARCHIVE
										})
									}}
								>
									Archived on {this.state.archiveDate}
								</Button>
								<Divider />
							</View>}
							<TextInput
								placeholder={'Insert Name (Required)'}
								placeholderTextColor='#ff6666'
								value={this.state.itemNameText}
								onChangeText={text => this.setState({ itemNameText: text })}
							/>
							<Divider />
							<TextInput
								placeholder={'Insert Price'}
								value={this.state.itemPriceText.toString()}
								keyboardType={'numeric'}
								onChangeText={text => this.setState({ itemPriceText: text })}
							/>
							<Divider />
							<View style={styles.CounterWrapper}>
								<Text							>
									Quantity:
								</Text>
								<IconButton
									icon='minus'
									size={20}
									onPress={this.itemQuantityCounterMinus}
								/>
								<Text								>
									{this.state.itemQuantityCounter}
								</Text>
								<IconButton
									icon='plus'
									size={20}
									onPress={this.itemQuantityCounterPlus}
								/>
							</View>
							<Divider />
							<View
								style={styles.UnitsWrapper}
							>
								<View
									style={styles.UnitsUserInputWrapper}
								>
									<TextInput
										placeholder={'0.00'}
										keyboardType={'numeric'}
										value={this.state.amountText.toString()}
										onChangeText={text => this.setState({ amountText: text })}
									/>
								</View>
								<View
									style={styles.UnitsUserInputWrapper}
								>
									<Picker
										selectedValue={this.state.unitPickerId}
										onValueChange={(itemValue, itemIndex) => {
											this.setState({ unitPickerId: itemValue })
										}}
										mode='dropdown'
									>
										{UnitPickerValueList}
									</Picker>
								</View>
							</View>
							<Divider />
							<Picker
								selectedValue={this.state.categoriesPickerId}
								onValueChange={(itemValue, itemIndex) => {
									this.setState({ categoriesPickerId: itemValue })
								}}
								mode='dropdown'
							>
								{CategoryPickerValueList}
							</Picker>
							<Divider />
							{this.props.route.name !== 'StoreItems' && <View>
								<Picker
									selectedValue={this.state.storePickerId}
									onValueChange={(itemValue, itemIndex) => {
										this.setState({ storePickerId: itemValue })
									}
									}
									mode='dropdown'
								>
									{StorePickerValueList}
								</Picker>
							</View>}
							<Divider />
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.state.toggleAddItemModal ? this.toggleAddItemModal : this.toggleEditItemModal}>Cancel</Button>
							<Button onPress={this.addAndEditItem}>Done</Button>
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
							<Button onPress={() => this.deleteItem(this.state.itemIdToDelete)}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.toggleExtraOptions}
						onDismiss={this.toggleExtraOptions}>
						<Dialog.Title>Extra Options</Dialog.Title>
						<Dialog.Content>
							<Divider />
							{this.state.itemTypeForExtraOptions !== itemType.STORE && <List.Item
								title={'Move To Store'}
								onPress={() => {
									this.updateItemType([itemType.STORE, this.state.itemIdForExtraOptions])
								}}
							/>}
							<Divider />
							{this.state.itemTypeForExtraOptions !== itemType.INVENTORY && <List.Item
								title={'Move To Inventory'}
								onPress={() => {
									this.updateItemType([itemType.INVENTORY, this.state.itemIdForExtraOptions])
								}}
							/>}
							<Divider />
							{this.state.itemTypeForExtraOptions !== itemType.ARCHIVE && <List.Item
								title={'Move to Archive'}
								onPress={() => {
									this.updateItemType([itemType.ARCHIVE, this.state.itemIdForExtraOptions])
								}}
							/>}
							<Divider />
						</Dialog.Content>
					</Dialog>
				</Portal>

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
