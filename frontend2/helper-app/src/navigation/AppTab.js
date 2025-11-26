// navigation/AppTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons as Icon } from '@expo/vector-icons';
import HomeScreen from '../screens/homeScreen.js';
import RequestsScreen from '../screens/requestScreen.js';
import ProfileScreen from '../screens/profileScreen.js';
import HelperReqScreen from '../screens/helperReqScreen.js';
import ChatWindow from '../screens/chatWindow.js';
import theme from '../styles/theme.js';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="H-App"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9AA4B2',
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          height: 66,
          paddingBottom: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'H-App') iconName = 'home-outline';
          else if (route.name === 'My Requests') iconName = 'document-text-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          else if (route.name === 'Helpers') iconName = 'people-outline';
          else if (route.name === 'ChatWindow') iconName = 'chatbubbles-outline';
          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="H-App" component={HomeScreen} />
      <Tab.Screen name="Helpers" component={HelperReqScreen} />
      <Tab.Screen name="My Requests" component={RequestsScreen} />
      <Tab.Screen name="ChatWindow" component={ChatWindow} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
