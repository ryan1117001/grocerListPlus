import React, { PureComponent } from 'react'
import { View, ScrollView, RefreshControl, TextInput, FlatList } from 'react-native';
import { styles } from './InventoryItemPage.styles'
import { List, Button, Provider, Portal, Dialog, Text, Surface, IconButton } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
	db, selectAllItemJoinedStoresByItemType, insertItem,
	deleteItem, selectAllStores
} from '../../Utils/SQLConstants';
import { itemType } from '../../Utils/TypeConstants'
import moment from 'moment'
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'

class InventoryItemPage extends PureComponent {
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			inventoryItemData: [],
			isRefreshing: false,
			showAddAllItemModal: false,
			showDeleteItemConfirmation: false,
			itemNameText: '',
			stores: [],
			selectedStoreId: 0,
			textInput: '',
			itemToDelete: null
		};
	}

	setHeader = (navigation) => {
		navigation.setOptions({
			headerTitle: 'Inventory',
			headerRight: () => (
				<View style={styles.HeaderWrapper}>
					<IconButton
						icon='magnify'
						onPress={() => { }}
					/>
					<IconButton
						icon='plus'
						onPress={this.showAddAllItemModal}
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
					this.hideDeleteItemConfirmation()
				},
				() => console.debug('error')
			)
		})
	}

	addItem = () => {
		if (this.state.itemNameText !== '') {
			console.debug(this.state.itemNameText, this.state.selectedStoreId)
			db.transaction(tx => {
				tx.executeSql(insertItem,
					[this.state.itemNameText, itemType.INVENTORY, this.state.selectedStoreId],
					() => {
						console.debug('success')
						this.queryAllInventoriedItems()
						this.hideAddAllItemModal()
						this.setState({
							itemNameText: '',
							selectedStoreId: ''
						})
					},
					() => {
						console.debug('Error')
						this.hideAddAllItemModal()
					}
				)
			})
		}
	}

	showAddAllItemModal = () => {
		this.setState({
			showAddAllItemModal: true
		})
	}

	hideAddAllItemModal = () => {
		this.setState({
			showAddAllItemModal: false
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
				{/* Showing data */}
				<FlatList
					style={styles.InventoryItemPageWrapper}
					refreshing={this.state.isRefreshing}
					onRefresh={this.forceRefresh}
					data={this.state.inventoryItemData}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							key={item.id}
							item={item}
							forceRefreshFunc={this.forceRefresh}
							showDeleteItemConfirmationFunc={this.showDeleteItemConfirmation}
						/>
					)}
				/>
				<Portal>
					<Dialog
						visible={this.state.showAddAllItemModal}
						onDismiss={this.hideAddAllItemModal}>
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
								<Button onPress={this.hideAddAllItemModal}>Cancel</Button>
								<Button onPress={this.addItem}>Done</Button>
							</Dialog.Actions>
						</Dialog.ScrollArea>
					</Dialog>
				</Portal>
				{/* Confirm Deletion */}
				<Portal>
					<Dialog
						visible={this.state.showDeleteItemConfirmation}
						onDismiss={this.hideDeleteItemConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be in inventory or in archive
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideDeleteItemConfirmation}>Cancel</Button>
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
