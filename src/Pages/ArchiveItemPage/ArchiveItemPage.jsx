import React, { PureComponent } from 'react'
import { View, FlatList } from 'react-native'
import {
	Provider, Portal, Button, Dialog, Text, IconButton
} from 'react-native-paper'
import {
	db, selectAllItemJoinedStoresByItemType, deleteItem
} from '../../Utils/SQLConstants'
import { styles } from './ArchiveItemPage.styles'
import { globalStyles } from '../../Utils/Global.styles';
import { itemType } from '../../Utils/TypeConstants'
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'

class ArchiveItemPage extends PureComponent {
	constructor(props) {
		super(props)

		this.setTabHeader(props.navigation)

		this.state = {
			showDeleteItemConfirmation: false,
			itemNameText: '',
			isRefreshing: false,
			archivedData: [],
			itemToDelete: null
		}
	}

	setTabHeader = (navigation) => {
		navigation.setOptions({
			title: 'Items'
		})
	}

	setStackHeader = (navigation) => {
		navigation.setOptions({
			headerTitle: 'Archive',
			headerStyle: {
				backgroundColor: '#5C00E7',
			},
			headerTintColor: '#FFF',
			headerRight: () => (
				<View style={globalStyles.HeaderIconWrapper}>
					<IconButton
						icon='magnify'
						color='#FFF'
						onPress={() => { }}
					/>
					<IconButton
						icon='plus'
						color='#FFF'
						onPress={() => { }}
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
		console.debug('ArchiveItemPage did mount')
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.queryAllArchivedItems()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => {
		console.debug('ArchiveItemPage did update')
		this.setStackHeader(this.props.route.params.stackNavigation)
	}

	componentWillUnmount = () => {
		console.debug('ArchiveItemPage will unmount')
		this._unsubscribe();
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

	deleteItem = () => {
		console.debug('delete item' + this.state.itemToDelete)
		db.transaction(tx => {
			tx.executeSql(
				deleteItem,
				[this.state.itemToDelete],
				() => {
					console.debug('success')
					this.hideDeleteItemConfirmation()
					this.forceRefresh()
				},
				() => console.debug('error')
			)
		})
	}

	queryAllArchivedItems = () => {
		console.debug('exec selectAllItemJoinedStoresByItemType')
		db.transaction(tx => {
			tx.executeSql(
				selectAllItemJoinedStoresByItemType,
				[itemType.ARCHIVE],
				(_, { rows: { _array } }) => {
					this.setState({
						archivedData: _array
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
		this.queryAllArchivedItems()
		this.setState({
			isRefreshing: false
		})
	}

	render() {
		return (
			<Provider>
				<FlatList
					style={styles.ArchiveItemPageWrapper}
					onRefresh={this.forceRefresh}
					refreshing={this.state.isRefreshing}
					data={this.state.archivedData}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							showDeleteItemConfirmationFunc={this.showDeleteItemConfirmation}
						/>
					)}
				/>
				{/* TODO: add item modal */}
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
		)
	}
}

ArchiveItemPage.propTypes = {

}

ArchiveItemPage.defaultProps = {

}

export default ArchiveItemPage