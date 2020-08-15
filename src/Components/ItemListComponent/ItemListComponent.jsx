import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { IconButton, Surface, Provider, List, Text } from 'react-native-paper'
import { styles } from './ItemListComponent.styles';
import { itemType } from '../../Utils/TypeConstants'
import PropTypes from 'prop-types';
import { db, updateItemType, updateItemPurchaseDate, updateItemArchiveDate } from '../../Utils/SQLConstants'
import moment from 'moment'
import { isNull, isUndefined } from 'lodash';

class ItemListComponent extends PureComponent {
	constructor(props) {
		super(props);

		// console.debug(props)
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

	componentDidUpdate = (prevProps,prevState) => {
		// console.log('ArchiveItemListComponent did update');
		if (prevProps.item !== this.props.item) {
			console.debug('ItemList update')
			this.setState({
				item : this.props.item
			})
		}
		console.debug(this.props.item)

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
				var date = moment(new Date()).format('YYYY-MM-DD')
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
				var date = moment(new Date()).format('YYYY-MM-DD')
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
		console.debug(item)
		var pricecheck = item.priceAmount
		var amountcheck = item.amountOfUnit
		var pricePerQtyCalc = 0
		var pricePerAmountCalc = 0
		if (isNull(pricecheck) || isUndefined(pricecheck) || pricecheck === '') {
			pricecheck = 0.00
		}
		else {
			pricecheck = pricecheck.toFixed(2)
		}
		if (isNull(amountcheck) || isUndefined(amountcheck) || amountcheck === '') {
			amountcheck = 1
		}
		pricePerQtyCalc = (pricecheck / item.quantity).toFixed(2)
		pricePerAmountCalc = (pricecheck / amountcheck).toFixed(2)

		var expirationDate = moment(item.expirationDate).locale('en-US').format('l')
		var purchaseDate = moment(item.purchaseDate).locale('en-US').format('l')
		var archiveDate = moment(item.archiveDate).locale('en-US').format('l')

		switch (item.itemType) {
			case itemType.STORE:
				return (
					<Text>
						{item.category + ":" + item.subCategory}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
					</Text>
				)
			case itemType.INVENTORY:
				return (
					<Text>
						{item.storeName + " | " + item.category + ":" + item.subCategory}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
						{"\nPurchased On: " + purchaseDate}
						{"\nExpires On: " + expirationDate}
					</Text>
				)
			case itemType.ARCHIVE:
				return (
					<Text>
						{item.storeName + " | " + item.category + ":" + item.subCategory}
						{"\nPrice: $ " + pricecheck}
						{"\nPrice Per Qty: $ " + pricePerQtyCalc}
						{"\nPrice Per Amount (" + item.unitName + ") : $ " + pricePerAmountCalc}
						{"\nPurchased On: " + purchaseDate}
						{"\nExpires On: " + expirationDate}
						{"\nArchived On: " + archiveDate}
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
							onLongPress={() => { this.props.toggleExtraOptionsFunc(item.itemId, item.itemType) }}
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
