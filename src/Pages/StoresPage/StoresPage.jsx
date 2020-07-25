import React, { PureComponent } from 'react';
import { View, TextInput, FlatList } from 'react-native';
import { styles } from './StoresPage.styles';
import { Button, Dialog, Portal, Provider, IconButton, Text } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import {
	db, insertStore, selectStoresByStoreType, deleteStore, deleteItemsByStoreId
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import moment from 'moment'
import { storeType } from '../../Utils/TypeConstants';

class StoresPage extends PureComponent {
	constructor(props) {
		super(props);

		this.setHeader(props.navigation)

		this.state = {
			showAddStoreModal: false,
			showDeleteStoreConfirmation: false,
			storeNameText: '',
			data: [],
			isRefreshing: false,
			storeToDelete: null
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
						onPress={() => { }}
					/>
					<IconButton
						icon='plus'
						color='#FFF'
						onPress={this.showAddStoreModal}
					/>
					<IconButton
						icon='dots-vertical'
						color='#FFF'
						onPress={(() => navigate('Settings', {}))}
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
						data: _array
					})
					console.debug('success')
				},
				() => console.debug("Error")
			)
		})
	}

	showAddStoreModal = () => {
		this.setState({
			showAddStoreModal: true
		});
	};

	hideAddStoreModal = () => {
		this.setState({
			showAddStoreModal: false
		});
	}

	showDeleteStoreConfirmation = (id) => {
		this.setState({
			showDeleteStoreConfirmation: true,
			storeToDelete: id
		})
	}

	hideDeleteStoreConfirmation = () => {
		this.setState({
			showDeleteStoreConfirmation: false,
			storeToDelete: null
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
				this.hideDeleteStoreConfirmation()
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
					this.hideAddStoreModal()
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
				<FlatList
					style={styles.HomePageWrapper}
					onRefresh={this.forceRefresh}
					refreshing={this.state.isRefreshing}
					data={this.state.data}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item, index, seperator }) => (
						<StoreListComponent
							store={item}
							forceRefreshFunction={this.forceRefresh}
							showDeleteStoreConfirmationFunc={this.showDeleteStoreConfirmation}
							navigation={this.props.navigation}
						/>
					)}
				/>

				{/* add new store */}
				<Portal>
					<Dialog
						visible={this.state.showAddStoreModal}
						onDismiss={this.hideAddStoreModal}>
						<Dialog.Title>Add A Store</Dialog.Title>
						<Dialog.Content>
							<TextInput
								placeholder={"Store Name"}
								onChangeText={text => this.setState({ storeNameText: text })}
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideAddStoreModal}>Cancel</Button>
							<Button onPress={this.addStoreName}>Done</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
				{/* Confirm Deletion */}
				<Portal>
					<Dialog
						visible={this.state.showDeleteStoreConfirmation}
						onDismiss={this.hideDeleteStoreConfirmation}>
						<Dialog.Title>Delete Items</Dialog.Title>
						<Dialog.Content>
							<Text>
								Deleting items means that they will no longer be in inventory or in archive
							</Text>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={this.hideDeleteStoreConfirmation}>Cancel</Button>
							<Button onPress={this.deleteStore}>Done</Button>
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
