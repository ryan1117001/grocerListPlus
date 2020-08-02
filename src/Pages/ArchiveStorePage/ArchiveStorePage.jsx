import React, { PureComponent } from 'react';
import { FlatList, View, TextInput } from 'react-native';
import { Provider, Portal, Dialog, Text, Button, IconButton, Searchbar, Snackbar, List } from 'react-native-paper';
import { styles } from './ArchiveStorePage.styles';
import { globalStyles } from '../../Utils/Global.styles';
import {
	db, selectStoresByStoreType, deleteItemsByStoreId, deleteStore, updateStoreType, updateStoreName
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
			toggleSearch: false,
			toggleSnackBar: false,
			toggleExtraStoreOptions: false,
			toggleEditStoreModal: false,
			snackBarStoreId: null,
			storeIDToEdit: null,
			storeNameText: '',
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
			storeToDelete: id ? id : this.state.storeToDelete,
			toggleDeleteStoreConfirmation: !this.state.toggleDeleteStoreConfirmation,
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
			snackBarStoreId: id ? id : this.state.snackBarStoreId,
			toggleSnackBar: true
		})
		console.debug('ID: ' + this.state.snackBarStoreId)
	}

	toggleExtraStoreOptions = (id) => {
		this.setState({
			storeIDToEdit: id ? id : this.state.storeIDToEdit,
			toggleExtraStoreOptions: !this.state.toggleExtraStoreOptions
		})
	}

	toggleEditStoreModal = () => {
		this.setState({
			toggleEditStoreModal: !this.state.toggleEditStoreModal
		})
	}

	searchForStore = () => {
		const { archivedStores, searchText } = this.state
		this.setState({
			searchResults: searchByStoreName(archivedStores, searchText)
		})
	}

	/**
	 * it will ever only be the undo back to the store item page
	 */
	undoUpdateStoreType = () => {
		db.transaction(tx => {
			console.debug('exec changeStoreType: ' + this.state.snackBarStoreId)
			tx.executeSql(
				updateStoreType,
				[storeType.ARCHIVE, this.state.snackBarStoreId],
				() => console.debug('changeStoreType success'),
				() => console.debug('changeStoreType error')
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
	editStoreName = () => {
		console.debug('exec editStore')
		db.transaction(tx => {
			tx.executeSql(
				updateStoreName,
				[this.state.storeNameText, this.state.storeIDToEdit],
				() => {
					console.debug('success')
					this.toggleEditStoreModal()
					this.forceRefresh()
				},
				() => console.debug('error')
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
							toggleSnackBarFunc={this.toggleSnackBar}
							toggleExtraStoreOptionsFunc={this.toggleExtraStoreOptions}
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
							this.undoUpdateStoreType()
						}
					}}>
					Switch this store back!
      			</Snackbar>
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
				{/* edit store name */}
				<Portal>
					<Dialog
						visible={this.state.toggleEditStoreModal}
						onDismiss={this.toggleEditStoreModal}>
						<Dialog.Title>Edit Store Name</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={"Store Name"}
								onChangeText={text => this.setState({ storeNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleEditStoreModal}>Cancel</Button>
							<Button onPress={this.editStoreName}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>

				<Portal>
					<Dialog
						visible={this.state.toggleExtraStoreOptions}
						onDismiss={this.toggleExtraStoreOptions}>
						<Dialog.Title>Extra Options</Dialog.Title>
						<Dialog.Content>
							<List.Item
								title={'Edit Store Name'}
								onPress={() => {
									this.toggleExtraStoreOptions()
									this.toggleEditStoreModal()
								}}
							/>
						</Dialog.Content>
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
