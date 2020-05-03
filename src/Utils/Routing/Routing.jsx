import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import {navigationRef, navigate} from './RootNavigation.js';
import { View } from 'react-native';
import HomePage from '../../Pages/HomePage/HomePage';
import FoodPage from '../../Pages/FoodPage/FoodPage';
import SettingsPage from '../../Pages/SettingsPage/SettingsPage';
import { styles } from './Routing.styles'
import { Button } from 'react-native-paper';

//import { RoutingWrapper } from './Routing.styles';




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
			<Tab.Screen name='Lists' component={HomePage} />
			<Tab.Screen name='Food' component={FoodPage} />
		</Tab.Navigator>
	);
}

export default function Routing() {
	const Stack = createStackNavigator();

	return (
		<NavigationContainer ref={navigationRef}>
			{/*    <SafeAreaView style={{ flex: 1 }}> */}
				<Stack.Navigator>
					<Stack.Screen name='Home' component={Home}
						options={{
							title: 'My Homepage',
							headerRight: headerRightButton
						}} />
					<Stack.Screen name='Settings' component={SettingsPage} />
				</Stack.Navigator>
			{/* </SafeAreaView> */}
		</NavigationContainer>
	);
}