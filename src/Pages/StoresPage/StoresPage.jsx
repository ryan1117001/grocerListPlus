import React, { PureComponent } from 'react';
import { View, RefreshControl, TextInput, FlatList } from 'react-native';
import { styles } from './StoresPage.styles';
import { Button, Dialog, Portal, Provider, Appbar, Text } from 'react-native-paper';
import { navigate } from '../../Utils/RootNavigation';
import {
	db, insertStore, selectStores, deleteStore, deleteItemsByStoreId
} from '../../Utils/SQLConstants';
import StoreListComponent from '../../Components/StoreListComponent/StoreListComponent'
import moment from 'moment'

class StoresPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			showAddStoreModal: false,
			storeNameText: '',
			data: [],
			isRefreshing: false,
			showMenuModal: false
		};
	}

	componentDidMount = () => {
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.queryAllStores()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	queryAllStores() {
		console.debug('exec queryAllStores')
		db.transaction(tx => {
			tx.executeSql(
				selectStores,
				[],
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

	hideEditStoreModal = () => {
		this.setState({
			showAddStoreModal: false
		})
	}

	showEditStoreModal = () => {
		this.setState({
			showAddStoreModal: true
		})
	}

	addStoreName = () => {
		var date = moment(new Date()).format('YYYY-MM-DD')
		console.debug('exec addStoreName ' + this.state.storeNameText + " " + date)
		db.transaction(tx => {
			tx.executeSql(insertStore, [this.state.storeNameText, date],
				() => {
					console.debug("Success")
					this.hideAddStoreModal()
					this.queryAllStores()
				},
				() => console.debug("Error")
			)
		})
	}
	
	forceRefresh = () => {
		this.setState({
			isRefreshing: true
		})
		this.queryAllStores()
		this.setState({
			isRefreshing: false
		})
	}

	render() {
		return (
			<Provider>
				<Appbar.Header>
					<Appbar.Content title='Stores' />
					<Appbar.Action icon='magnify' onPress={() => { }} />
					<Appbar.Action icon='plus' onPress={this.showAddStoreModal} />
					<Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
				</Appbar.Header>
				<FlatList
					style={styles.HomePageWrapper}
					onRefresh={this.forceRefresh}
					refreshing={this.state.isRefreshing}
					data={this.state.data}
					renderItem={({ item, index, seperator }) => (
						<StoreListComponent
							key={item.id}
							store={item}
							forceRefreshFunction={this.forceRefresh}
						/>
					)

					}
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
