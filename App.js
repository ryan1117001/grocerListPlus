import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { navigationRef } from './src/Utils/RootNavigation';

import StoresPage from './src/Pages/StoresPage/StoresPage';
import StoreItemsPage from './src/Pages/StoreItemsPage/StoreItemsPage'
import AllItemsPage from './src/Pages/AllItemsPage/AllItemsPage';
import SettingsPage from './src/Pages/SettingsPage/SettingsPage';
import {
  db, enableFK, createItemsTable, createStoresTable
} from './src/Utils/SQLConstants';

function tabNavigator() {
  const Tab = createMaterialBottomTabNavigator();
  return (
    <Tab.Navigator
      barStyle={{
        backgroundColor: '#5C00E7'
      }}
    >
      <Tab.Screen
        name='stores'
        component={StoresPage}
        options={{
          title: 'Stores',
          tabBarIcon: 'store'
        }}
      />
      <Tab.Screen
        name='allItems'
        component={AllItemsPage}
        options={{
          title: 'All Items',
          tabBarIcon: 'treasure-chest'
        }}
      />
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
      <Stack.Navigator headerMode='none'>
        <Stack.Screen
          name='stores'
          component={tabNavigator}
        />
        <Stack.Screen
          name='settings'
          component={SettingsPage}
        />
        <Stack.Screen
          name='storeItems'
          component={StoreItemsPage}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}