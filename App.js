import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routing from './src/Utils/Routing/index';

export default function App() {
  return (
    // <SafeAreaProvider>
      <Routing />
    // </SafeAreaProvider>
  );
}