import React, { PureComponent } from 'react'
import { View, ScrollView, RefreshControl, TextInput } from 'react-native';
import { styles } from './InventoryPage.styles'
import { List, Button, Checkbox, Provider, Appbar, Portal, Dialog, Text, Surface } from 'react-native-paper'
import { Picker } from '@react-native-community/picker'
import { navigate } from '../../Utils/RootNavigation'
import {
	db, selectAllItemJoinedStoresByItemType, insertItem,
	deleteItem, selectStores, changeItemType
} from '../../Utils/SQLConstants';
import { itemType } from '../../Utils/TypeConstants'

class InventoryPage extends PureComponent {
	constructor(props) {
		super(props);
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
				selectStores,
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
				changeItemType,
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
								left={() => <Checkbox.Item
									label=''
									status={item.itemType === itemType.INVENTORY ? 'unchecked' : 'checked'}
									onPress={this.changeItemType.bind(this, [itemType.ARCHIVE, item.id])}
								/>}
								right={() =>
									<Button
										onPress={this.deleteItem.bind(this, item.id)}
									>
										Delete
              						</Button>
								}
								title={item.itemName}
								description={item.storeName + " | " + item.dateToGo}
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
				<ScrollView style={styles.InventoryPageWrapper} refreshControl={
					<RefreshControl
						refreshing={this.state.isRefreshing}
						onRefresh={this.forceRefresh}
					/>
				}>
					<Appbar.Header>
						<Appbar.Content title='Inventory' />
						<Appbar.Action icon='magnify' onPress={() => { }} />
						<Appbar.Action icon='plus' onPress={this.showAddAllItemModal} />
						<Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
					</Appbar.Header>
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

InventoryPage.propTypes = {
	// bla: PropTypes.string,
};

InventoryPage.defaultProps = {
	// bla: 'test',
};

export default InventoryPage;
