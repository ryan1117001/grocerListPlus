import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';
import { List, Divider, Portal, Dialog, Text, Button, Provider } from 'react-native-paper';
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
			toggleReinitializeDBModal: false
		};
		SETTINGS = [
			{
				tabId: 1,
				title: 'About',
				description: 'About the developer!',
				function: () => this.navigateToAbout()
			},
			{
				tabId: 2,
				title: 'Reset',
				description: 'Completely remove all data',
				function: () => this.toggleReinitializeDBModal()
			}
		]
	}

	componentDidMount = () => { }

	componentDidCatch(error, info) { }

	componentDidUpdate = () => { }

	componentWillUnmount = () => { }

	toggleReinitializeDBModal = () => {
		this.setState({
			toggleReinitializeDBModal: !this.state.toggleReinitializeDBModal
		})
	}

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

	reinitializeDB = () => {
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

	render() {
		return (
			<Provider>
				<ScrollView style={styles.SettingsPageWrapper}>
					<List.Section>
						{SETTINGS.map(item =>
							<View
								key={item.tabId}
							>
								<List.Item
									key={item.tabId}
									title={item.description}
									description={item.description}
									onPress={item.function}
								/>
								<Divider />
							</View>
						)}
					</List.Section>
					{/* delete item confirmation */}
					<Portal>
						<Dialog
							visible={this.state.toggleReinitializeDBModal}
							onDismiss={this.toggleReinitializeDBModal}>
							<Dialog.Title>Reinitialize The App</Dialog.Title>
							<Dialog.Content>
								<Text>
									Reinitializing means all data will be lost, and everything will be reset.
							</Text>
							</Dialog.Content>
							<Dialog.Actions>
								<Button onPress={this.toggleReinitializeDBModal}>Cancel</Button>
								<Button onPress={() => this.reinitializeDB()}>Confirm</Button>
							</Dialog.Actions>
						</Dialog>
					</Portal>
				</ScrollView>
			</Provider>
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
