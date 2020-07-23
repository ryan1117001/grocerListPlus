import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { IconButton, Surface, Provider, List, Text } from 'react-native-paper'
import { styles } from './ItemListComponent.styles';
import { itemType, storeType } from '../../Utils/TypeConstants'
import PropTypes from 'prop-types';
import { db, updateItemType, updatePurchaseDate } from '../../Utils/SQLConstants'
import moment from 'moment'

class ItemListComponent extends PureComponent {
	constructor(props) {
		super(props);

		console.debug(props)

		this.state = {
			itemName: props.item.itemName,
			storeName: props.item.storeName,
			dateToGo: props.item.dateToGo,
			itemType: props.item.itemType,
			storeName: props.item.storeName,
			purchaseDate: props.item.purchaseDate,
			id: props.item.id,
		};
	}

	componentDidMount = () => {
		// console.log('ArchiveItemListComponent mounted');
	}

	componentDidCatch(error, info) {
		// You can also log the error to an error reporting service
	}

	componentDidUpdate = () => {
		// console.log('ArchiveItemListComponent did update');
	}

	componentWillUnmount = () => {
		// console.log('ArchiveItemListComponent will unmount');
	}

	updateItemType = () => {
		var args = []

		switch (this.state.itemType) {
			case itemType.STORE:
				args = [itemType.INVENTORY, this.state.id]
				break
			case itemType.INVENTORY:
				args = [itemType.ARCHIVE, this.state.id]
				break
			case itemType.ARCHIVE:
				args = [itemType.INVENTORY, this.state.id]
				break
		}

		db.transaction(tx => {
			console.debug('exec changeItemType')
			console.debug(args)
			tx.executeSql(
				updateItemType,
				args,
				() => console.debug('changeItemType success'),
				() => console.debug('changeItemType error')
			)
			if (this.state.itemType === itemType.STORE) {
				console.debug('exec updatePurchaseDate')
				var date = moment(new Date()).format('YYYY-MM-DD')
				tx.executeSql(
					updatePurchaseDate,
					[date, args[1]],
					() => console.debug('updatePurchaseDate success'),
					() => console.debug('updatePurchaseDate error')
				)
			}
		},
			() => console.debug('error'),
			() => {
				this.props.forceRefreshFunc()
			})
	}

	setDescription = () => {
		switch (this.state.itemType) {
			case itemType.STORE:
				return <Text>Store Temp</Text>
			case itemType.INVENTORY:
				return <Text>{this.state.storeName + " | " + moment(this.state.purchaseDate).locale('en-US').format('l')}</Text>
			case itemType.ARCHIVE:
				return <Text>{this.state.storeName + " | " + this.state.dateToGo}</Text>
			default:
				<Text>Description Error</Text>
				console.debug('Description Error')
		}
	}

	render() {
		return (
			<Provider>
				<View style={styles.ArchiveItemListComponentWrapper}>
					<Surface
						key={this.state.id}
						style={styles.Surface}>
						<List.Item
							title={<Text style={styles.itemTitle}>{this.state.itemName}</Text>}
							description={this.setDescription}
							key={this.state.id}
							left={() =>
								<IconButton
									icon={this.state.itemType === itemType.ARCHIVE ? 'arrow-left-bold-box-outline' : 'arrow-right-bold-box-outline'}
									onPress={this.updateItemType}
								/>
							}
							right={() =>
								<IconButton
									icon='trash-can-outline'
									onPress={() => this.props.showDeleteItemConfirmationFunc(this.state.id)}
								/>
							}

						/>
					</Surface>
				</View>
			</Provider>
		);
	}
}

ItemListComponent.propTypes = {
	itemName: PropTypes.string,
	storeName: PropTypes.string,
	id: PropTypes.number,
	dateToGo: PropTypes.string,
	showDeleteItemConfirmation: PropTypes.func,
	forceRefreshFunc: PropTypes.func
};

ItemListComponent.defaultProps = {
	// bla: 'test',
};

export default ItemListComponent;
