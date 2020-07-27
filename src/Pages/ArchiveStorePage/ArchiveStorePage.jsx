import React, { PureComponent } from 'react';
import { FlatList, View } from 'react-native';
import { Provider, Portal, Dialog, Text, Button, IconButton, Searchbar } from 'react-native-paper';
import { styles } from './ArchiveStorePage.styles';
import { globalStyles } from '../../Utils/Global.styles';
import {
	db, selectStoresByStoreType, deleteItemsByStoreId, deleteStore
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import { storeType } from '../../Utils/TypeConstants';
import { searchByStoreName } from '../../Utils/SearchUtil'

class ArchiveStorePage extends PureComponent {
	constructor(props) {
		super(props);
		console.debug(props)

		this.setTabHeader(props.navigation)

		this.state = {
			storeNameText: '',
			archivedStores: [],
			searchResults: [],
			isRefreshing: false,
			storeToDelete: null,
			toggleSearch: false
		};
	}

	setTabHeader = (navigation) => {
		navigation.setOptions({
			title: 'Store'
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
		console.debug('ArchiveStorePage did mount')
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.queryStores()
		})
	}

	componentDidCatch(error, info) {
		// You can also log the error to an error reporting service
	}

	componentDidUpdate = (prevProps) => {
		console.debug('ArchiveStorePage did update')
		this.setStackHeader(this.props.route.params.stackNavigation)
	}

	componentWillUnmount = () => {
		this._unsubscribe()
		console.log('ArchiveStorePage will unmount');
	}

	toggleDeleteStoreConfirmation = (id) => {
		this.setState({
			storeToDelete: this.state.toggleDeleteItemConfirmation && id !== null ? null : id,
			toggleDeleteStoreConfirmation: !this.state.toggleDeleteStoreConfirmation,
		})
	}

	toggleSearchBar = () => {
		this.setState({
			toggleSearch: !this.state.toggleSearch
		})
	}

	searchForStore = () => {
		const { archivedStores, searchText } = this.state
		this.setState({
			searchResults: searchByStoreName(archivedStores, searchText)
		})
	}

	deleteStore = () => {
		db.transaction(tx => {
			console.debug('exec deleteItemsByStoreId')
			tx.executeSql(deleteItemsByStoreId, [this.state.storeToDelete])
			console.debug('exec deleteStore')
			tx.executeSql(deleteStore, [this.state.storeToDelete])
		},
			(error) => console.debug(error),
			() => {
				console.debug('parent refresh')
				this.forceRefresh()
				this.toggleDeleteStoreConfirmation()
			}
		)
	}

	forceRefresh = () => {
		this.setState({
			isRefreshing: true
		})
		this.queryStores()
		this.setState({
			isRefreshing: false
		})
	}

	queryStores() {
		console.debug('exec queryStores')
		db.transaction(tx => {
			tx.executeSql(
				selectStoresByStoreType,
				[storeType.ARCHIVE],
				(_, { rows: { _array } }) => {
					console.debug(_array)
					this.setState({
						archivedStores: _array
					})
					console.debug('success')
				},
				() => console.debug("Error")
			)
		})
	}

	render() {
		return (
			<Provider>
				{this.state.toggleSearch && <Searchbar
					placeholder='Search'
					onChangeText={query => this.setState({ searchText: query })}
					value={this.state.searchText}
					onSubmitEditing={this.searchForStore}
				/>}
				<FlatList
					style={styles.HomePageWrapper}
					onRefresh={this.forceRefresh}
					refreshing={this.state.isRefreshing}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.archivedStores}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<StoreListComponent
							store={item}
							forceRefreshFunction={this.forceRefresh}
							navigation={this.props.navigation}
							showDeleteStoreConfirmationFunc={this.toggleDeleteStoreConfirmation}
						/>
					)}
				/>
				{/* Confirm Deletion */}
				<Portal>
					<Dialog
						visible={this.state.toggleDeleteStoreConfirmation}
						onDismiss={this.toggleDeleteStoreConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be in inventory or in archive
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleDeleteStoreConfirmation}>Cancel</Button>
							<Button onPress={this.deleteStore}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			</Provider >
		);
	}
}

ArchiveStorePage.propTypes = {
	// bla: PropTypes.string,
};

ArchiveStorePage.defaultProps = {
	// bla: 'test',
};

export default ArchiveStorePage;
