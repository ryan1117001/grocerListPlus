import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { navigationRef } from './src/Utils/RootNavigation';
import { enableScreens } from 'react-native-screens';
import StoresPage from './src/Pages/StoresPage/StoresPage';
import StoreItemsPage from './src/Pages/StoreItemsPage/StoreItemsPage'
import SettingsPage from './src/Pages/SettingsPage/SettingsPage';
import {
	db, enableFK, createItemsTable, createStoresTable
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
				initialParams={{
					stackNavigation: stackNavigation
				}}
			/>
			<TopTabNav.Screen
				name='ArchiveItems'
				component={StoreItemsPage}
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
			/>
			<StoreStackContainer.Screen
				name='StoreItems'
				component={StoreItemsPage}
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
				name='SettingsStackContainer'
				component={SettingsPage}
				options={{
					headerTitle: 'Settings',
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
	db.transaction((tx) => {
		console.debug('exec enableFK')
		tx.executeSql(enableFK);
		console.debug('exec createStoresTable')
		tx.executeSql(createStoresTable);
		console.debug('exec createItemsTable')
		tx.executeSql(createItemsTable)
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