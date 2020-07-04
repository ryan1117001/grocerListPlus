import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { navigationRef, navigate } from './src/Utils/RootNavigation';
import { Button } from 'react-native-paper';

import StoresPage from './src/Pages/StoresPage/StoresPage';
import StoreItemsPage from './src/Pages/StoreItemsPage/StoreItemsPage'
import AllItemsPage from './src/Pages/AllItemsPage/AllItemsPage';
import SettingsPage from './src/Pages/SettingsPage/SettingsPage';
import {
  db, enableFK, createItemsTable, createStoresTable
} from './src/Utils/SQLConstants';

function headerRightButton() {
  return (
    <Button
      onPress={() => navigate('Settings', {})}
      title='Go to Settings'
      color="#00cc00"
    >
      Settings
    </Button>
  )
}

function tabNavigator() {
  const Tab = createMaterialBottomTabNavigator();
  return (
    <Tab.Navigator >
      <Tab.Screen name='Stores' component={StoresPage} />
      <Tab.Screen name='All Items' component={AllItemsPage} />
    </Tab.Navigator>
  )
}

function initDB() {
  db.transaction((tx) => {
    tx.executeSql(enableFK);
    tx.executeSql(createStoresTable);
    tx.executeSql(createItemsTable)
  },
    (error) => console.debug(error),
    () => console.debug('successful init')
  )
};

export default function App() {
  const Stack = createStackNavigator()

  initDB()

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name='Stores' component={tabNavigator}
          options={{
            title: 'GrocerListPlus',
            headerRight: headerRightButton
          }} />
        <Stack.Screen
          name='Settings'
          component={SettingsPage}
        />
        <Stack.Screen
          name='Store Items'
          component={StoreItemsPage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}