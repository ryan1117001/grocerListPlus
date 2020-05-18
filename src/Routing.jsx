import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import {navigationRef, navigate} from './Utils/RootNavigation';
import HomePage from './Pages/HomePage/HomePage';
import FormPage from './Pages/FormPage'
import FoodPage from './Pages/FoodPage/FoodPage';
import SettingsPage from './Pages/SettingsPage/SettingsPage';
import { styles } from './Routing.styles'
import { Button } from 'react-native-paper';

import SQLiteDB from './Utils/SQLiteDB'

function headerRightButton() {
	return (
		<Button
			onPress={() => navigate('Settings', {})}
			title='Go to Settings'
			color="#00cc00"
		>
			Settings
		</Button>)
}

function Home() {

	const Tab = createMaterialBottomTabNavigator();

	return (
		<Tab.Navigator >
			<Tab.Screen name='Home' component={HomePage} />
			<Tab.Screen name='Food' component={FoodPage} />
		</Tab.Navigator>
	);
}

export default function Routing() {
	const Stack = createStackNavigator();

	

	return (
		<NavigationContainer ref={navigationRef}>
				<Stack.Navigator>
					<Stack.Screen name='Home' component={Home}
						options={{
							title: 'GrocerListPlus',
							headerRight: headerRightButton
						}} />
					<Stack.Screen name='Settings' component={SettingsPage} />
					<Stack.Screen name='Forms' component={FormPage} />
				</Stack.Navigator>
		</NavigationContainer>
	);
}