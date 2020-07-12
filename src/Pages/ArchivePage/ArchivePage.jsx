import React, { PureComponent } from 'react'
import { ScrollView, View, RefreshControl } from 'react-native'
import { navigate } from '../../Utils/RootNavigation'
import {
	List, Modal, Provider, Portal,
	Button, Dialog, Checkbox, Appbar, Surface
} from 'react-native-paper'
import {
	db, selectAllItemJoinedStoresByItemType
} from '../../Utils/SQLConstants'
import {styles} from './ArchivePage.styles'
import {itemType} from '../../Utils/TypeConstants'

class ArchivePage extends PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			showAddItemModal: false,
			itemNameText: '',
			isRefreshing: false,
			archivedData: []
		}
	}

	componentDidMount = () => {
		this._unsubscribe = this.props.navigation.addListener('focus', () => {
			this.queryAllArchivedItems()
		})
	}

	componentDidCatch(error, info) { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => {
		this._unsubscribe();
	}

	showAddItemModal = () => {
		this.setState({
			showAddItemModal: true
		})
	}

	hideAddItemModal = () => {
		this.setState({
			showAddItemModal: false
		})
	}

	deleteItem = (id) => {
		console.debug('delete item')
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

	queryAllArchivedItems = () => {
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

	renderItems = (data) => {
		if (data.length > 0) {
			return (
				data.map((item) => {
					return (
						<Surface
							key={item.id}
							style={styles.Surface}>
							<List.Item
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

	render() {

		const archivedList = this.renderItems(this.state.archivedData)

		return (
			<Provider>
				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={this.state.isRefreshing}
							onRefresh={this.forceRefresh}
						/>
					}
				>
					<Appbar.Header>
						<Appbar.Content title='Archive' />
						<Appbar.Action icon='magnify' onPress={() => { }} />
						<Appbar.Action icon='plus' onPress={this.showAddItemModal} />
						<Appbar.Action icon='dots-vertical' onPress={() => { navigate('settings', {}) }} />
					</Appbar.Header>

					{archivedList}
				</ScrollView>
			</Provider>
		)
	}
}

ArchivePage.propTypes = {

}

ArchivePage.defaultProps = {

}

export default ArchivePage