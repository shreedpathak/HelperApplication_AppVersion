import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/authContext.js';
import LoginScreen from '../screens/loginScreen.js';
import AppTabs from './AppTab.js'; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // After login, show bottom tabs
        <Stack.Screen name="MainApp" component={AppTabs} />
      ) : (
        // Before login, show login screen
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
