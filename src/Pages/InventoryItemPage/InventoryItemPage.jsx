import React, { PureComponent } from 'react'
import { View, TextInput, FlatList } from 'react-native';
import { styles } from './InventoryItemPage.styles'
import { Button, Provider, Portal, Dialog, Text, IconButton, Searchbar, Snackbar } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import {
	db, selectAllItemJoinedStoresByItemType, insertInventoryItem,
	deleteItem, selectAllStores, updateItemType
} from '../../Utils/SQLConstants';
import { itemType } from '../../Utils/TypeConstants'
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import moment from 'moment'
import { searchByItemName } from '../../Utils/SearchUtil'

class InventoryItemPage extends PureComponent {
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			inventoryItemData: [],
			isRefreshing: false,
			toggleShowAddAllItemModal: false,
			toggleDeleteItemConfirmation: false,
			itemNameText: '',
			stores: [],
			searchResults: [],
			selectedStoreId: 0,
			textInput: '',
			itemToDelete: null,
			toggleSearch: false,
			toggleSnackBar: false,
			snackBarItemId: null
		};
	}

	setHeader = (navigation) => {
		navigation.setOptions({
			headerTitle: 'Inventory',
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
						icon='plus'
						color='#FFF'
						onPress={this.toggleShowAddAllItemModal}
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

	componentDidUpdate = () => { }

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	queryAllStores() {
		db.transaction(tx => {
			tx.executeSql(
				selectAllStores,
				[],
				(_, { rows: { _array } }) => {

					if (_array.length > 0) {
						this.setState({
							stores: _array,
							selectedStoreId: _array[0].id
						})
					}
				},
				() => console.debug("Error")
			)
		})
	}

	queryAllInventoriedItems = () => {
		db.transaction(tx => {
			tx.executeSql(
				selectAllItemJoinedStoresByItemType,
				[itemType.INVENTORY],
				(_, { rows: { _array } }) => {
					this.setState({
						inventoryItemData: _array
					})
				},
				() => console.debug('Error')
			)
		})
	}

	deleteItem = () => {
		console.debug('delete item: id ' + this.state.itemToDelete)
		db.transaction(tx => {
			tx.executeSql(
				deleteItem,
				[this.state.itemToDelete],
				() => {
					console.debug('success')
					this.forceRefresh()
					this.toggleDeleteItemConfirmation()
				},
				(error) => { console.debug(error) }
			)
		})
	}

	addItem = () => {
		if (this.state.itemNameText !== '') {
			console.debug(this.state.itemNameText, this.state.selectedStoreId)
			var date = moment(new Date()).format('YYYY-MM-DD')
			db.transaction(tx => {
				tx.executeSql(insertInventoryItem,
					[this.state.itemNameText, itemType.INVENTORY, this.state.selectedStoreId, date],
					() => {
						console.debug('success')
						this.queryAllInventoriedItems()
						this.toggleShowAddAllItemModal()
						this.setState({
							itemNameText: '',
							selectedStoreId: ''
						})
					},
					(error) => {
						console.debug(error)
						this.toggleShowAddAllItemModal()
					}
				)
			})
		}
	}

	/**
	 * it will ever only be the undo back to the inventory item page
	 */
	undoUpdateItemType = () => {
		db.transaction(tx => {
			console.debug('exec changeItemType: ' + this.state.snackBarItemId)
			tx.executeSql(
				updateItemType,
				[itemType.INVENTORY, this.state.snackBarItemId],
				() => console.debug('changeItemType success'),
				() => console.debug('changeItemType error')
			)
		},
			(error) => console.debug(error),
			() => {
				console.debug('transaction success')
				this.forceRefresh()
				this.setState({
					toggleSnackBar: false
				})
			})
	}

	toggleShowAddAllItemModal = () => {
		this.setState({
			toggleShowAddAllItemModal: !this.state.toggleShowAddAllItemModal
		})
	}

	toggleDeleteItemConfirmation = (id) => {
		this.setState({
			itemToDelete: id ? id : this.state.itemToDelete,
			toggleDeleteItemConfirmation: !this.state.toggleDeleteItemConfirmation,
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

	toggleSearchBar = () => {
		this.setState({
			toggleSearch: !this.state.toggleSearch
		})
	}

	searchForStore = () => {
		const { inventoryItemData, searchText } = this.state
		this.setState({
			searchResults: searchByItemName(inventoryItemData, searchText)
		})
	}

	forceRefresh = () => {
		this.setState({
			isRefreshing: true
		})
		this.queryAllInventoriedItems()
		this.queryAllStores()
		this.setState({
			isRefreshing: false,
		})
	}

	renderPickerItems = () => {
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
	render() {
		const pickerValueList = this.renderPickerItems()

		return (
			<Provider>
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForStore}
				/>}
				{/* Showing data */}
				<FlatList
					style={styles.InventoryItemPageWrapper}
					refreshing={this.state.isRefreshing}
					onRefresh={this.forceRefresh}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.inventoryItemData}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							showDeleteItemConfirmationFunc={this.toggleDeleteItemConfirmation}
							toggleSnackBarFunc={this.toggleSnackBar}
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
					<Dialog
						visible={this.state.toggleShowAddAllItemModal}
						onDismiss={this.toggleShowAddAllItemModal}>
						<Dialog.ScrollArea>
							<Dialog.Title> Add Item </Dialog.Title>
							<Dialog.Content>
								<TextInput
									style={styles.dialogTextInput}
									mode='outlined'
									placeholder={'Item Name'}
									onChangeText={text => this.setState({ itemNameText: text })}
								/>
								<View>
									<Text> Stores </Text>
									<Picker
										selectedValue={this.state.selectedStoreId}
										onValueChange={(itemValue, itemIndex) => {
											this.setState({ selectedStoreId: itemValue })
										}
										}
										mode='dropdown'
									>
										{pickerValueList}
									</Picker>
								</View>

							</Dialog.Content>
							<Dialog.Actions>
								<Button onPress={this.toggleShowAddAllItemModal}>Cancel</Button>
								<Button onPress={this.addItem}>Done</Button>
							</Dialog.Actions>
						</Dialog.ScrollArea>
					</Dialog>
				</Portal>
				{/* Confirm Deletion */}
				<Portal>
					<Dialog
						visible={this.state.toggleDeleteItemConfirmation}
						onDismiss={this.toggleDeleteItemConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be in inventory or in archive
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleDeleteItemConfirmation}>Cancel</Button>
							<Button onPress={this.deleteItem}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			</Provider>
		);
	}
}

InventoryItemPage.propTypes = {
	// bla: PropTypes.string,
};

InventoryItemPage.defaultProps = {
	// bla: 'test',
};

export default InventoryItemPage;
