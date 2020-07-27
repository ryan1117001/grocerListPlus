import React, { PureComponent } from 'react'
import { View, FlatList } from 'react-native'
import {
	Provider, Portal, Button, Dialog, Text, IconButton, Searchbar
} from 'react-native-paper'
import {
	db, selectAllItemJoinedStoresByItemType, deleteItem
} from '../../Utils/SQLConstants'
import { styles } from './ArchiveItemPage.styles'
import { globalStyles } from '../../Utils/Global.styles';
import { itemType } from '../../Utils/TypeConstants'
import ItemListComponent from '../../Components/ItemListComponent/ItemListComponent'
import { searchByItemName } from '../../Utils/SearchUtil'

class ArchiveItemPage extends PureComponent {
	constructor(props) {
		super(props)

		this.setTabHeader(props.navigation)

		this.state = {
			toggleDeleteItemConfirmation: false,
			itemNameText: '',
			isRefreshing: false,
			archivedItems: [],
			searchResults: [],
			itemToDelete: null,
			toggleSearch: false
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

	toggleDeleteItemConfirmation = (id) => {
		this.setState({
			itemToDelete: this.state.toggleDeleteItemConfirmation && id !== null ? null : id,
			toggleDeleteItemConfirmation: !this.state.toggleDeleteItemConfirmation,
		})
	}

	toggleSearchBar = () => {
		this.setState({
			toggleSearch: !this.state.toggleSearch
		})
	}

	searchForItem = () => {
		const { archivedItems, searchText } = this.state
		this.setState({
			searchResults: searchByItemName(archivedItems, searchText)
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
					this.toggleDeleteItemConfirmation()
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
						archivedItems: _array
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
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForItem}
				/>}
				<FlatList
					style={styles.ArchiveItemPageWrapper}
					onRefresh={this.forceRefresh}
					refreshing={this.state.isRefreshing}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.archivedItems}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<ItemListComponent
							item={item}
							forceRefreshFunc={this.forceRefresh}
							showDeleteItemConfirmationFunc={this.toggleDeleteItemConfirmation}
						/>
					)}
				/>
				{/* TODO: add item modal */}
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
		)
	}
}

ArchiveItemPage.propTypes = {

}

ArchiveItemPage.defaultProps = {

}

export default ArchiveItemPage