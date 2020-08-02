import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { IconButton, Surface, Provider, List, Text } from 'react-native-paper'
import { styles } from './ItemListComponent.styles';
import { itemType } from '../../Utils/TypeConstants'
import PropTypes from 'prop-types';
import { db, updateItemType, updateItemPurchaseDate, updateItemArchiveDate } from '../../Utils/SQLConstants'
import moment from 'moment'

class ItemListComponent extends PureComponent {
	constructor(props) {
		super(props);

		// console.debug(props)

		this.state = {
			itemName: props.item.itemName,
			storeName: props.item.storeName,
			dateToGo: props.item.dateToGo,
			itemType: props.item.itemType,
			storeName: props.item.storeName,
			purchaseDate: moment(props.item.purchaseDate).locale('en-US').format('l'),
			archiveDate: moment(props.item.archiveDate).locale('en-US').format('l'),
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
				console.debug('exec updateItemPurchaseDate')
				var date = moment(new Date()).format('YYYY-MM-DD')
				tx.executeSql(
					updateItemPurchaseDate,
					[date, this.state.id],
					() => console.debug('updateItemPurchaseDate success'),
					() => console.debug('updateItemPurchaseDate error')
				)
			}
			else if (this.state.itemType === itemType.INVENTORY) {
				console.debug('exec updateArchiveDate')
				var date = moment(new Date()).format('YYYY-MM-DD')
				tx.executeSql(
					updateItemArchiveDate,
					[date, this.state.id],
					() => console.debug('updateItemArchiveDate success'),
					() => console.debug('updateItemArchiveDate error')
				)
			}
		},
			() => console.debug('error'),
			() => {
				console.debug('success')
				this.props.forceRefreshFunc()
				this.props.toggleSnackBarFunc(this.state.id)
			})
	}

	setDescription = () => {
		switch (this.state.itemType) {
			case itemType.STORE:
				return <Text>Store Temp</Text>
			case itemType.INVENTORY:
				return <Text>{this.state.storeName + " | Purchased On: " + this.state.purchaseDate}</Text>
			case itemType.ARCHIVE:
				return <Text>{this.state.storeName + " | Archived On: " + this.state.archiveDate}</Text>
			default:
				<Text>Description Error</Text>
				console.debug('Description Error')
		}
	}

	setLeftButton = () => {
		switch (this.state.itemType) {
			case itemType.ARCHIVE:
				return <IconButton
					icon='arrow-left-bold-box-outline'
					onPress={this.updateItemType}
				/>
			default:
				return <IconButton
					icon='arrow-right-bold-box-outline'
					onPress={this.updateItemType}
				/>
		}
	}

	render() {
		return (
			<Provider>
				<View style={styles.ItemListComponentWrapper}>
					<Surface
						key={this.state.id}
						style={styles.Surface}>
						<List.Item
							title={<Text style={styles.itemTitle}>{this.state.itemName}</Text>}
							onPress={() => { }}
							onLongPress={() => { this.props.toggleExtraOptionsFunc(this.state.id) }}
							description={this.setDescription}
							key={this.state.id}
							left={this.setLeftButton}
							right={() =>
								<IconButton
									icon='trash-can-outline'
									onPress={() => this.props.toggleDeleteItemConfirmationFunc(this.state.id)}
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
	toggleDeleteItemConfirmationFunc: PropTypes.func,
	forceRefreshFunc: PropTypes.func,
	toggleSnackBarFunc: PropTypes.func,
	toggleExtraOptionsFunc: PropTypes.func
};

ItemListComponent.defaultProps = {
	// bla: 'test',
	toggleExtraOptionsFunc: () => { }
};

export default ItemListComponent;
