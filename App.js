import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { navigationRef, navigate } from './src/Utils/RootNavigation';
import { enableScreens } from 'react-native-screens';
import StoresPage from './src/Pages/StoresPage/StoresPage';
import StoreItemsPage from './src/Pages/StoreItemsPage/StoreItemsPage'
import InventoryItemPage from './src/Pages/InventoryItemPage/InventoryItemPage';
import SettingsPage from './src/Pages/SettingsPage/SettingsPage';
import ArchiveItemPage from './src/Pages/ArchiveItemPage/ArchiveItemPage';
import ArchiveStorePage from './src/Pages/ArchiveStorePage/ArchiveStorePage';
import {
	db, enableFK, createItemsTable, createStoresTable
} from './src/Utils/SQLConstants';
import { IconButton } from 'react-native-paper';

function topTabNavigator() {
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
				component={ArchiveStorePage}
				options={{
					title: 'Archived Stores',
				}}
			/>
			<TopTabNav.Screen
				name='ArchiveItems'
				component={ArchiveItemPage}
				options={{
					title: 'Archived Items'
				}}
			/>
		</TopTabNav.Navigator>
	)
}

function bottomTabNavigator() {
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
				component={topTabNavigator}
				options={{
					headerTitle: 'Archive',
					headerStyle: {
						backgroundColor: '#5C00E7',
					},
					headerTintColor: '#FFF',
					headerRight: () => (
						<IconButton
							icon='dots-vertical'
							color='#FFF'
							onPress={(() => navigate('Settings', {}))}
						/>
					)
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
				name='InventoryContainer'
				component={InventoryItemPage}
			/>
		</InventoryContainer.Navigator>
	)
}

function bottomTabContainer() {
	const BottomStackContainer = createStackNavigator()
	return (
		<BottomStackContainer.Navigator
			headerMode='none'
		>
			<BottomStackContainer.Screen
				name='BottomTabContainer'
				component={bottomTabNavigator}
			/>
		</BottomStackContainer.Navigator>
	)
}

function settingsContainer() {
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
					component={bottomTabContainer}
				/>
				<RootStack.Screen
					name='Settings'
					component={settingsContainer}
				/>
			</RootStack.Navigator>
		</NavigationContainer>
	);
}