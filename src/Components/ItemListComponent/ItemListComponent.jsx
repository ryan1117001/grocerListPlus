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
		const { item } = props

		this.state = {
			itemName: item.itemName,
			quantity: item.quantity,
			storeName: item.storeName,
			dateToGo: item.dateToGo,
			itemType: item.itemType,
			storeName: item.storeName,
			expirationDate: moment(item.expirationDate).locale('en-US').format('l'),
			purchaseDate: moment(item.purchaseDate).locale('en-US').format('l'),
			archiveDate: moment(item.archiveDate).locale('en-US').format('l'),
			itemId: item.itemId,
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
				args = [itemType.INVENTORY, this.state.itemId]
				break
			case itemType.INVENTORY:
				args = [itemType.ARCHIVE, this.state.itemId]
				break
			case itemType.ARCHIVE:
				args = [itemType.INVENTORY, this.state.itemId]
				break
		}

		db.transaction(tx => {
			console.debug('exec changeItemType')
			console.debug(args)
			tx.executeSql(
				updateItemType, args,
				() => {
					// console.debug('changeItemType success')
				},
				(error) => console.debug(error)
			)
			if (this.state.itemType === itemType.STORE) {
				console.debug('exec updateItemPurchaseDate')
				var date = moment(new Date()).format('YYYY-MM-DD')
				tx.executeSql(
					updateItemPurchaseDate, [date, this.state.itemId],
					() => {
						// console.debug('updateItemPurchaseDate success')
					},
					(error) => console.debug(error)
				)
			}
			else if (this.state.itemType === itemType.INVENTORY) {
				console.debug('exec updateArchiveDate')
				var date = moment(new Date()).format('YYYY-MM-DD')
				tx.executeSql(
					updateItemArchiveDate,
					[date, this.state.itemId],
					() => {
						// console.debug('updateItemArchiveDate success')
					},
					(error) => console.debug(error)
				)
			}
		},
			(error) => console.debug(error),
			() => {
				this.props.forceRefreshFunc()
				this.props.toggleSnackBarFunc(this.state.itemId)
			})
	}

	setDescription = () => {
		switch (this.state.itemType) {
			case itemType.STORE:
				return (
					<Text>{this.props.item.category + ":" + this.props.item.subCategory}</Text>
				)
			case itemType.INVENTORY:
				return (
					<Text>
						{this.state.storeName + " | " + this.props.item.category + ":" + this.props.item.subCategory}
						{"\nPurchased On: " + this.state.purchaseDate}
						{"\nExpires On: " + this.props.item.expirationDate}
					</Text>
				)
			case itemType.ARCHIVE:
				return (
					<Text>
						{this.state.storeName + " | " + this.props.item.category + ":" + this.props.item.subCategory}
						{"\nPurchased On: " + this.state.purchaseDate}
						{"\nExpires On: " + this.props.item.expirationDate}
						{"\nArchived On: " + this.state.archiveDate}
					</Text>
				)
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
						key={this.state.itemId}
						style={styles.Surface}>
						<List.Item
							title={<Text style={styles.itemTitle}>{this.state.itemName}</Text>}
							onPress={() => { this.props.toggleEditItemModalFunc(this.props.item) }}
							onLongPress={() => { this.props.toggleExtraOptionsFunc(this.state.itemId, this.state.itemType) }}
							description={this.setDescription}
							key={this.state.itemId}
							left={this.setLeftButton}
							right={() =>
								<IconButton
									icon='trash-can-outline'
									onPress={() => this.props.toggleDeleteItemConfirmationFunc(this.state.itemId)}
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
	itemId: PropTypes.number,
	dateToGo: PropTypes.string,
	toggleDeleteItemConfirmationFunc: PropTypes.func,
	forceRefreshFunc: PropTypes.func,
	toggleSnackBarFunc: PropTypes.func,
	toggleExtraOptionsFunc: PropTypes.func,
	toggleEditItemModalFunc: PropTypes.func
};

ItemListComponent.defaultProps = {
	// bla: 'test',
	toggleExtraOptionsFunc: () => { }
};

export default ItemListComponent;
