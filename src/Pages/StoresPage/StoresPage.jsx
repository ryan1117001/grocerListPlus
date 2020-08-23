import React, { PureComponent } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { styles } from './StoresPage.styles';
import { Button, Dialog, Portal, Provider, IconButton, Text, Searchbar, Snackbar, List } from 'react-native-paper';
import {
	db, insertStore, selectStoresByStoreType, deleteStore, deleteItemsByStoreId, updateStoreType,
	updateStoreName
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import { storeType } from '../../Utils/TypeConstants';
import { searchByStoreName } from '../../Utils/SearchUtil'
import dayjs from 'dayjs'
class StoresPage extends PureComponent {

	/**
	 * 
	 * @param {*} props 
	 */
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			// Data
			searchResults: [],
			stores: [],

			//store text changes
			storeNameText: '',

			// Toggle true or false
			toggleDeleteStoreConfirmation: false,
			toggleExtraStoreOptions: false,
			toggleEditStoreModal: false,
			toggleRefreshing: false,
			toggleSearch: false,
			toggleShowAddStoreModal: false,
			toggleSnackBar: false,

			//Store Ids to perform actions to
			storeIdToUndo: null,
			storeIdToEdit: null,
			storeIdToDelete: null,
		};
	}

	componentDidMount = () => {
		//console.debug('StoresPage did Mount)
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.forceRefresh()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => {
		// console.debug('ArchiveStorePage did update')
		if (this.props.route.name === 'ArchiveStores') {
			this.setHeader(this.props.route.params.stackNavigation)
		}
	}

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	// Headers are set here
	/**
	 * 
	 * @param {*} navigation 
	 */
	setHeader = (navigation) => {
		const { route } = this.props
		navigation.setOptions({
			headerTitle: route.name === 'ArchiveStores' ? 'Archive' : 'Stores',
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
						onPress={this.toggleShowAddStoreModal}
					/>
				</View>
			)
		})
	}

	// Toggles are set here

	/**
	 * 
	 */
	toggleShowAddStoreModal = () => {
		this.setState({
			toggleShowAddStoreModal: !this.state.toggleShowAddStoreModal
		});
	};

	/**
	 * 
	 * @param {*} id 
	 */
	toggleDeleteStoreConfirmation = (id) => {
		this.setState({
			storeIdToDelete: this.state.toggleDeleteItemConfirmation && id !== null ? null : id,
			toggleDeleteStoreConfirmation: !this.state.toggleDeleteStoreConfirmation,
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
			storeIdToUndo: id ? id : this.state.storeIdToUndo,
			toggleSnackBar: !this.state.toggleSnackBar
		})
	}

	/**
	 * 
	 * @param {*} id 
	 */
	toggleExtraStoreOptions = (id) => {
		this.setState({
			storeIdToEdit: id ? id : this.state.storeIdToEdit,
			toggleExtraStoreOptions: !this.state.toggleExtraStoreOptions
		})
	}

	/**
	 * 
	 */
	toggleEditStoreModal = () => {
		this.setState({
			toggleEditStoreModal: !this.state.toggleEditStoreModal
		})
	}

	/**
	 * 
	 */
	toggleRefreshing = () => {
		this.setState({
			toggelRefreshing: !this.state.toggleRefreshing
		})
	}

	/**
	 * 
	 */
	selectStoresByStoreType() {
		console.debug('exec selectStoresByStoreType')
		var args = []
		switch (this.props.route.name) {
			case 'Stores':
				args = [storeType.INUSE]
				break
			case 'ArchiveStores':
				args = [storeType.ARCHIVE]
				break
		}
		db.transaction(tx => {
			tx.executeSql(
				selectStoresByStoreType,
				args,
				(_, { rows: { _array } }) => {
					this.setState({
						stores: _array
					})
					// console.debug('success')
				},
				(error) => console.debug(error)
			)
		},
			(error) => console.debug(error),
			() => {
				// console.debug('success')
			})
	}



	/**
	 * it will ever only be the undo back to the store item page
	 */
	updateStoreType = () => {
		var args = []
		switch (this.props.route.name) {
			case 'Stores':
				args = [storeType.INUSE, this.state.storeIdToUndo]
				break
			case 'ArchiveStores':
				args = [storeType.ARCHIVE, this.state.storeIdToUndo]
				break
		}

		db.transaction(tx => {
			console.debug('exec changeStoreType: ' + this.state.storeIdToUndo)
			tx.executeSql(
				updateStoreType,
				args,
				() => console.debug('changeStoreType success'),
				() => console.debug('changeStoreType error')
			)
		},
			(error) => console.debug(error),
			() => {
				// console.debug('transaction success')
				this.forceRefresh()
				this.setState({
					toggleSnackBar: false
				})
			})
	}

	deleteStore = () => {
		db.transaction(tx => {
			console.debug('exec deleteItemsByStoreId')
			tx.executeSql(deleteItemsByStoreId, [this.state.storeIdToDelete])
			console.debug('exec deleteStore')
			tx.executeSql(deleteStore, [this.state.storeIdToDelete])
		},
			(error) => console.debug(error),
			() => {
				// console.debug('parent refresh')
				this.forceRefresh()
				this.toggleDeleteStoreConfirmation()
			}
		)
	}

	insertStore = () => {
		var date = dayjs().format('YYYY-MM-DD')
		var args = []
		switch (this.props.route.name) {
			case 'Stores':
				args = [this.state.storeNameText, date, date, storeType.INUSE]
				break
			case 'ArchiveStores':
				args = [this.state.storeNameText, date, date, storeType.ARCHIVE]
				break
		}
		console.debug()
		db.transaction(tx => {
			tx.executeSql(
				insertStore,
				args,
				() => {
					this.toggleShowAddStoreModal()
					this.forceRefresh()
				},
				(error) => console.debug(error)
			)
		},
			(error) => console.debug(error),
			() => {	}
		)
	}

	updateStoreName = () => {
		console.debug('exec editStore')
		db.transaction(tx => {
			tx.executeSql(
				updateStoreName,
				[this.state.storeNameText, this.state.storeIdToEdit],
				() => {
					this.toggleEditStoreModal()
					this.forceRefresh()
				},
				(error) => console.debug(error)
			)
		})
	}

	forceRefresh = () => {
		this.setState({
			storeNameText: '',
			toggleRefreshing: true,
		})
		this.selectStoresByStoreType()
		this.setState({
			toggleRefreshing: false
		})
	}


	searchForStore = () => {
		const { stores, searchText } = this.state
		this.setState({
			searchResults: searchByStoreName(stores, searchText)
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
					refreshing={this.state.toggleRefreshing}
					data={this.state.toggleSearch ? this.state.searchResults : this.state.stores}
					keyExtractor={(item) => item.storeId.toString()}
					renderItem={({ item, index, seperator }) => (
						<StoreListComponent
							store={item}
							forceRefreshFunction={this.forceRefresh}
							showDeleteStoreConfirmationFunc={this.toggleDeleteStoreConfirmation}
							navigation={this.props.navigation}
							toggleSnackBarFunc={this.toggleSnackBar}
							toggleExtraStoreOptionsFunc={this.toggleExtraStoreOptions}
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
							this.updateStoreType()
						}
					}}>
					Switch this store back!
      			</Snackbar>

				{/* add new store */}
				<Portal>
					<Dialog
						visible={this.state.toggleShowAddStoreModal}
						onDismiss={this.toggleShowAddStoreModal}>
						<Dialog.Title>Add A Store</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={"Store Name"}
								onChangeText={text => this.setState({ storeNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleShowAddStoreModal}>Cancel</Button>
							<Button onPress={this.insertStore}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
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
							<Button onPress={this.updateStoreName}>Done</Button>
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

StoresPage.propTypes = {
	// bla: PropTypes.string,
};

StoresPage.defaultProps = {
	// bla: 'test',
};

export default StoresPage;
