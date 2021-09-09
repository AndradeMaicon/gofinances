import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'styled-components';
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Dashboard } from '../screens/Dashboard';
import { Register } from '../screens/Register';
import { RFValue } from 'react-native-responsive-fontsize';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoute() {
  const theme = useTheme()

  return(
    <Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: [{
            paddingVertical: Platform.OS === 'ios' ? 20 : 0,
            height: RFValue(88)
          },
          null
        ],
        tabBarHideOnKeyboard: true,
      }}
    >
      <Screen
        name='Listagem'
        component={Dashboard}
        options={{
          tabBarIcon: (({size, color}) => (
            <MaterialIcons 
              name='format-list-bulleted'
              size={size}
              color={color}
            />
          )),
          headerShown: false
        }}
      />

      <Screen 
        name='Cadastrar'
        component={Register}
        options={{
          tabBarIcon: (({size, color}) => (
            <MaterialIcons 
              name='attach-money'
              size={size}
              color={color}
            />
          )),
          headerShown: false
        }}  
      />

      <Screen 
        name='Resumo' 
        component={Register}
        options={{
          tabBarIcon: (({size, color}) => (
            <MaterialIcons 
              name='pie-chart'
              size={size}
              color={color}
            />
          )),
          headerShown: false
        }}
      />
    </Navigator>
  )
}