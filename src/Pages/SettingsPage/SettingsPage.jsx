import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { List, Appbar, Divider } from 'react-native-paper';
import * as styles from './SettingsPage.styles';
import {
	db, deleteItems, dropItemsTable, dropStoreTable,
	dropCategoriesTable, dropSettingsTable, enableFK, createItemsTable,
	createStoresTable, insertInitSetting,
	createSettingsTable, createCategoriesTable,
	insertDefaultCategories, insertDefaultUnits,
	createUnitsTables,
	dropUnitsTable
} from '../../Utils/SQLConstants';

var SETTINGS = []

class SettingsPage extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			hasError: false,
		};
		SETTINGS = [
			{
				id: 1,
				title: 'About',
				description: 'About the developer!',
				function: () => this.navigateToAbout()
			},
			{
				id: 2,
				title: 'Reset',
				description: 'Completely remove all data',
				function: () => this.reinitailizeDB()
			}
		]
	}

	componentDidMount = () => { }

	componentDidCatch(error, info) { }

	getSnapshotBeforeUpdate = (prevProps, prevState) => { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => { }

	removeAllItems = () => {
		console.debug('remove items')
		db.transaction((tx) => {
			tx.executeSql(deleteItems);
		},
			(error) => console.debug(error),
			() => console.debug('successful')
		)
	}

	navigateToAbout = () => {
		this.props.navigation.navigate('About')
	}

	reinitailizeDB = () => {
		console.debug('drop tables')
		db.transaction((tx) => {
			//Drop table
			tx.executeSql(dropItemsTable)
			tx.executeSql(dropStoreTable)
			tx.executeSql(dropCategoriesTable)
			tx.executeSql(dropSettingsTable)
			tx.executeSql(dropUnitsTable)

			tx.executeSql(enableFK);
			//create tables
			tx.executeSql(createStoresTable);
			tx.executeSql(createItemsTable)
			tx.executeSql(createSettingsTable)
			tx.executeSql(createCategoriesTable)
			tx.executeSql(createUnitsTables)
			//initialize default settings
			tx.executeSql(insertInitSetting, [1, 1])
			tx.executeSql(insertDefaultCategories)
			tx.executeSql(insertDefaultUnits)
		},
			(error) => console.debug(error),
			() => {
				console.debug('successful')
				this.props.navigation.reset({
					index: 0,
					routes: [{ name: 'StoreStack' }],
				});
			}
		)
	}

	identifySQLQuery = (id) => {
		switch (id) {
			case 1:
				this.removeAllStores();
				break;
			case 2:
				this.reinitailizeDB();
				break;
		}
	}

	render() {
		return (
			<View style={styles.SettingsPageWrapper}>
				<List.Section>
					{SETTINGS.map(item =>
						<View
							key={item.id}
						>
							<List.Item
								key={item.id}
								title={item.description}
								description={item.description}
								onPress={item.function}
							/>
							<Divider />
						</View>
					)}
				</List.Section>
			</View>
		);
	}
}

SettingsPage.propTypes = {
	// bla: PropTypes.string,
};

SettingsPage.defaultProps = {
	// bla: 'test',
};

export default SettingsPage;
