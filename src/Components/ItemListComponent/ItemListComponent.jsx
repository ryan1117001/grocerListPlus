import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { IconButton, Surface, Provider, List, Text } from 'react-native-paper'
import { styles } from './ItemListComponent.styles';
import { itemType } from '../../Utils/TypeConstants'
import PropTypes from 'prop-types';
import { db, updateItemType, updateItemPurchaseDate, updateItemArchiveDate } from '../../Utils/SQLConstants'
import { isNull, isUndefined } from 'lodash';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'

class ItemListComponent extends PureComponent {
	constructor(props) {
		super(props);
		dayjs.extend(localizedFormat)
		const { item } = props
		this.state = {
			item: item,
		};
	}

	componentDidMount = () => {
		// console.log('ArchiveItemListComponent mounted');
	}

	componentDidCatch(error, info) {
		// You can also log the error to an error reporting service
	}

	componentDidUpdate = (prevProps, prevState) => {
		// console.log('ArchiveItemListComponent did update');
		if (prevProps.item !== this.props.item) {
			console.debug('ItemList update')
			this.setState({
				item: this.props.item
			})
		}
	}

	componentWillUnmount = () => {
		// console.log('ArchiveItemListComponent will unmount');
	}

	updateItemType = () => {
		var args = []

		const { item } = this.state

		switch (item.itemType) {
			case itemType.STORE:
				args = [itemType.INVENTORY, item.itemId]
				break
			case itemType.INVENTORY:
				args = [itemType.ARCHIVE, item.itemId]
				break
			case itemType.ARCHIVE:
				args = [itemType.INVENTORY, item.itemId]
				break
		}
		console.debug(args)
		db.transaction(tx => {
			console.debug('exec changeItemType')
			tx.executeSql(
				updateItemType, args,
				() => {
					// console.debug('changeItemType success')
				},
				(error) => console.debug(error)
			)
			if (item.itemType === itemType.STORE) {
				console.debug('exec updateItemPurchaseDate')
				var date = dayjs().format('YYYY-MM-DD')
				tx.executeSql(
					updateItemPurchaseDate, [date, item.itemId],
					() => {
						// console.debug('updateItemPurchaseDate success')
					},
					(error) => console.debug(error)
				)
			}
			else if (item.itemType === itemType.INVENTORY) {
				console.debug('exec updateArchiveDate')
				var date = dayjs().format('YYYY-MM-DD')
				tx.executeSql(
					updateItemArchiveDate,
					[date, item.itemId],
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
				this.props.toggleSnackBarFunc(item.itemId)
			})
	}

	setDescription = () => {

		const { item } = this.state

		var pricecheck = Number(item.priceAmount)
		var amountcheck = Number(item.amountOfUnit)
		var pricePerQtyCalc = 0
		var pricePerAmountCalc = 0
		if (isNull(pricecheck) || isUndefined(pricecheck) || pricecheck === '') {
			pricecheck = 0.00
		}
		else {
			pricecheck = pricecheck.toFixed(2)
		}
		if (isNull(amountcheck) || isUndefined(amountcheck) || amountcheck === '' || amountcheck === 0) {
			amountcheck = 1
		}
		pricePerQtyCalc = (pricecheck / item.quantity).toFixed(2)
		pricePerAmountCalc = (pricecheck / amountcheck).toFixed(2)

		var expirationDate = dayjs(item.expirationDate).format('L')
		var purchaseDate = dayjs(item.purchaseDate).format('L')
		var itemArchiveDate = dayjs(item.itemArchiveDate).format('L')
		switch (item.itemType) {
			case itemType.STORE:
				return (
					<Text>
						{item.category}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
					</Text>
				)
			case itemType.INVENTORY:
				return (
					<Text>
						{item.storeName + " | " + item.category}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
						{"\nExpires On: " + expirationDate}
						{"\nPurchased On: " + purchaseDate}
					</Text>
				)
			case itemType.ARCHIVE:
				return (
					<Text>
						{item.storeName + " | " + item.category}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
						{"\nExpires On: " + expirationDate}
						{"\nPurchased On: " + purchaseDate}
						{"\nArchived On: " + itemArchiveDate}
					</Text>
				)
			default:
				<Text>Description Error</Text>
				console.debug('Description Error')
		}
	}

	setLeftButton = () => {
		switch (this.state.item.itemType) {
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
		const { item } = this.state
		return (
			<Provider>
				<View style={styles.ItemListComponentWrapper}>
					<Surface
						key={item.itemId}
						style={styles.Surface}>
						<List.Item
							title={<Text style={styles.itemTitle}>{item.itemName}</Text>}
							onPress={() => { this.props.toggleEditItemModalFunc(item) }}
							onLongPress={() => { this.props.toggleExtraOptionsFunc(item.itemId, item.itemType, item.storeId) }}
							description={this.setDescription}
							key={item.itemId}
							left={this.setLeftButton}
							right={() =>
								<IconButton
									icon='trash-can-outline'
									onPress={() => this.props.toggleDeleteItemConfirmationFunc(item.itemId)}
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
