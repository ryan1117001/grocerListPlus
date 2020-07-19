import React, { PureComponent } from 'react'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import { styles } from './InventoryItemPage.styles'
import { List, Button, Checkbox, Provider, Portal, Dialog, Text, Surface, IconButton } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
	db, selectAllItemJoinedStoresByItemType, insertItem,
	deleteItem, selectAllStores, updateItemType
} from '../../Utils/SQLConstants';
import { itemType } from '../../Utils/TypeConstants'
import moment from 'moment'

class InventoryItemPage extends PureComponent {
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			inventoryItemData: [],
			isRefreshing: false,
			showAddAllItemModal: false,
			itemNameText: '',
			stores: [],
			selectedStoreId: 0,
			textInput: '',
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

	changeItemType = (args) => {
		db.transaction(tx => {
			tx.executeSql(
				updateItemType,
				args,
				() => {
					console.debug('success')
					this.forceRefresh()
				},
				() => console.debug('error')
			)
		})
	}

	deleteItem = (id) => {
		console.debug('delete item: id ' + id)
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

	renderItems = (data) => {
		if (data.length > 0) {
			return (
				data.map((item) => {
					return (
						<Surface
							key={item.id}
							style={styles.Surface}>
							<List.Item
								left={() =>
									<IconButton
										icon='archive-arrow-up'
										onPress={this.changeItemType.bind(this, [itemType.ARCHIVE, item.id])}
									/>
								}
								right={() =>
									<Button
										onPress={this.deleteItem.bind(this, item.id)}
									>
										Delete
              						</Button>
								}
								title={item.itemName}
								description={item.storeName + " | " + moment(item.purchaseDate).locale('en-US').format('l')}
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
		const inventoryItemList = this.renderItems(this.state.inventoryItemData)
		const pickerValueList = this.renderPickerItems()

		return (
			<Provider>
				<ScrollView style={styles.InventoryItemPageWrapper} refreshControl={
					<RefreshControl
						refreshing={this.state.isRefreshing}
						onRefresh={this.forceRefresh}
					/>
				}>
					{/* Showing data */}
					{inventoryItemList}
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
				</ScrollView>
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
