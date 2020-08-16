import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { navigationRef } from './src/Utils/RootNavigation';
import { enableScreens } from 'react-native-screens';
import StoresPage from './src/Pages/StoresPage/StoresPage';
import StoreItemsPage from './src/Pages/StoreItemsPage/StoreItemsPage'
import SettingsPage from './src/Pages/SettingsPage/SettingsPage'
import AboutPage from './src/Pages/AboutPage/AboutPage'
import {
	db, enableFK, createItemsTable, createStoresTable, retrieveSettings,
	insertInitSetting, createSettingsTable, createCategoriesTable,
	insertDefaultCategories,
	insertDefaultUnits,
	createUnitsTables
} from './src/Utils/SQLConstants';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings([
	'Non-serializable values were found in the navigation state',
]);

function TopTabNavigator({ navigation: stackNavigation }) {
	const TopTabNav = createMaterialTopTabNavigator()
	return (
		<TopTabNav.Navigator
			tabBarOptions={{
				activeTintColor: '#5C00E7',
				indicatorStyle: {
					borderBottomColor: '#5C00E7',
					borderBottomWidth: 2,
				},
			}}
		>
			<TopTabNav.Screen
				name='ArchiveStores'
				component={StoresPage}
				options={{
					title: 'Stores'
				}}
				initialParams={{
					stackNavigation: stackNavigation
				}}
			/>
			<TopTabNav.Screen
				name='ArchiveItems'
				component={StoreItemsPage}
				options={{
					title: 'Items'
				}}
				initialParams={{
					stackNavigation: stackNavigation
				}}
			/>
		</TopTabNav.Navigator>
	)
}

function BottomTabNavigator() {
	const BottomTabNav = createMaterialBottomTabNavigator();

	return (
		<BottomTabNav.Navigator
			barStyle={{
				backgroundColor: '#5C00E7'
			}}
		>
			<BottomTabNav.Screen
				name='StoreStack'
				component={StoreContainer}
				options={{
					title: 'Stores',
					tabBarIcon: 'store',
				}}
			/>
			<BottomTabNav.Screen
				name='Inventory'
				component={InventoryContainer}
				options={{
					title: 'Inventory',
					tabBarIcon: 'treasure-chest',

				}}
			/>
			<BottomTabNav.Screen
				name='ArchiveStack'
				component={ArchiveContainer}
				options={{
					title: 'Archive',
					tabBarIcon: 'archive'
				}}
			/>
		</BottomTabNav.Navigator>
	)
}

function ArchiveContainer() {
	const ArchiveStackContainer = createStackNavigator()
	return (
		<ArchiveStackContainer.Navigator>
			<ArchiveStackContainer.Screen
				name='ArchiveContainer'
				component={TopTabNavigator}
				options={{
					headerStyle: {
						backgroundColor: '#5C00E7',
					}
				}}
			/>
			<ArchiveStackContainer.Screen
				name='ArchiveStoreItems'
				component={StoreItemsPage}
				options={{
					headerStyle: {
						backgroundColor: '#5C00E7',
					}
				}}
			/>
		</ArchiveStackContainer.Navigator>
	)
}

function StoreContainer() {
	const StoreStackContainer = createStackNavigator()
	return (
		<StoreStackContainer.Navigator>
			<StoreStackContainer.Screen
				name='Stores'
				component={StoresPage}
				options={{
					headerStyle: {
						backgroundColor: '#5C00E7',
					}
				}}
			/>
			<StoreStackContainer.Screen
				name='StoreItems'
				component={StoreItemsPage}
				options={{
					headerStyle: {
						backgroundColor: '#5C00E7',
					}
				}}
			/>
		</StoreStackContainer.Navigator>
	)
}

function InventoryContainer() {
	const InventoryContainer = createStackNavigator()
	return (
		<InventoryContainer.Navigator>
			<InventoryContainer.Screen
				name='InventoryItems'
				component={StoreItemsPage}
				options={{
					headerStyle: {
						backgroundColor: '#5C00E7',
					}
				}}
			/>
		</InventoryContainer.Navigator>
	)
}

function BottomTabContainer() {
	const BottomStackContainer = createStackNavigator()
	return (
		<BottomStackContainer.Navigator
			headerMode='none'
		>
			<BottomStackContainer.Screen
				name='BottomTabContainer'
				component={BottomTabNavigator}
			/>
		</BottomStackContainer.Navigator>
	)
}

function SettingsContainer() {
	const SettingsStackContainer = createStackNavigator()
	return (
		<SettingsStackContainer.Navigator>
			<SettingsStackContainer.Screen
				name='Settings'
				component={SettingsPage}
				options={{
					headerTitle: 'Settings',
					headerStyle: {
						backgroundColor: '#5C00E7',
					},
					headerTintColor: '#FFF',

				}}
			/>
			<SettingsStackContainer.Screen
				name='About'
				component={AboutPage}
				options={{
					headerTitle: 'About',
					headerStyle: {
						backgroundColor: '#5C00E7',
					},
					headerTintColor: '#FFF',

				}}
			/>
		</SettingsStackContainer.Navigator>
	)
}
function initDB() {
	console.debug('exec initDB')

	db.transaction((tx) => {
		tx.executeSql(
			retrieveSettings, [],
			(tx, resultSet) => {
				console.debug('settings found')
				console.debug(resultSet.rows._array)
			},
			(error) => {
				console.debug('settings does not exist')
				//enable foriegn keys
				tx.executeSql(enableFK);
				//create tables
				tx.executeSql(createStoresTable);
				tx.executeSql(createItemsTable)
				tx.executeSql(createSettingsTable)
				tx.executeSql(createCategoriesTable)
				tx.executeSql(createUnitsTables)
				//initialize default settings
				tx.executeSql(insertInitSetting, [1, 1, 1])
				tx.executeSql(insertDefaultCategories)
				tx.executeSql(insertDefaultUnits)
			}
		)
	},
		(error) => console.debug(error),
		() => console.debug('successful init')
	)
};

export default function App() {

	initDB()
	enableScreens();
	const RootStack = createStackNavigator()

	return (
		<NavigationContainer ref={navigationRef}>
			<RootStack.Navigator
				headerMode='none'
			>
				<RootStack.Screen
					name='BottomTabContainer'
					component={BottomTabContainer}
				/>
				<RootStack.Screen
					name='Settings'
					component={SettingsContainer}
				/>
			</RootStack.Navigator>
		</NavigationContainer>
	);
}