import React, { PureComponent } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { styles } from './StoresPage.styles';
import { Button, Dialog, Portal, Provider, IconButton, Text, Searchbar, Snackbar } from 'react-native-paper';
import {
	db, insertStore, selectStoresByStoreType, deleteStore, deleteItemsByStoreId, updateStoreType
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import moment from 'moment'
import { storeType } from '../../Utils/TypeConstants';
import { searchByStoreName } from '../../Utils/SearchUtil'

class StoresPage extends PureComponent {
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			toggleShowAddStoreModal: false,
			toggleDeleteStoreConfirmation: false,
			toggleExtraStoreOptions: false,
			storeNameText: '',
			stores: [],
			searchResults: [],
			isRefreshing: false,
			storeToDelete: null,
			toggleSearch: false,
			toggleSnackBar: false,
			snackBarStoreId: null,
		};
	}

	setHeader = (navigation) => {
		navigation.setOptions({
			headerTitle: 'Stores',
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
			this.queryStores()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	queryStores() {
		console.debug('exec queryStores')
		db.transaction(tx => {
			tx.executeSql(
				selectStoresByStoreType,
				[storeType.INUSE],
				(_, { rows: { _array } }) => {
					console.debug(_array)
					this.setState({
						stores: _array
					})
					console.debug('success')
				},
				() => console.debug("Error")
			)
		})
	}

	toggleShowAddStoreModal = () => {
		this.setState({
			toggleShowAddStoreModal: !this.state.toggleShowAddStoreModal
		});
	};

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

	toggleSnackBar = (id) => {
		console.debug('ID: ' + id)
		this.setState({
			snackBarStoreId: id ? id : this.state.snackBarStoreId,
			toggleSnackBar: true
		})
		console.debug('ID: ' + this.state.snackBarStoreId)
	}

	toggleExtraStoreOptions = () => {
		this.setState({
			toggleExtraStoreOptions: !this.state.toggleExtraStoreOptions
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
				[storeType.INUSE, this.state.snackBarStoreId],
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

	searchForStore = () => {
		const { stores, searchText } = this.state
		this.setState({
			searchResults: searchByStoreName(stores, searchText)
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

	addStoreName = () => {
		var date = moment(new Date()).format('YYYY-MM-DD')
		console.debug('exec addStoreName ' + this.state.storeNameText + " " + date)
		db.transaction(tx => {
			tx.executeSql(insertStore, [this.state.storeNameText, date, storeType.INUSE],
				() => {
					console.debug("Success")
					this.toggleShowAddStoreModal()
					this.queryStores()
				},
				() => console.debug("Error")
			)
		})
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
					data={this.state.toggleSearch ? this.state.searchResults : this.state.stores}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<StoreListComponent
							store={item}
							forceRefreshFunction={this.forceRefresh}
							showDeleteStoreConfirmationFunc={this.toggleDeleteStoreConfirmation}
							navigation={this.props.navigation}
							toggleSnackBarFunc={this.toggleSnackBar}
							toggleExtraStoreOptions={this.toggleExtraStoreOptions}
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
							<Button onPress={this.addStoreName}>Done</Button>
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

				<Portal>
					<Dialog
						visible={this.state.toggleExtraStoreOptions}
						onDismiss={this.toggleExtraStoreOptions}>
						<Dialog.Title>Extra Options</Dialog.Title>
						<Dialog.Content>
							<Text>
								Extra Options
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.toggleExtraStoreOptions}>Cancel</Button>
						</Dialog.Actions>
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
