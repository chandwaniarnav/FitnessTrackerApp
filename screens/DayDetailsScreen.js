import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WorkoutScreen from './WorkoutScreen';
import CardioScreen from './CardioScreen';
import MealScreen from './MealScreen';
import WaterScreen from './WaterScreen';
import ProfileScreen from './ProfileScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { firebase } from '../utils/firebaseConfig';

const Tab = createBottomTabNavigator();

export default function DayDetailsScreen({ route }) {
  const { date,userId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Workout') {
            iconName = 'fitness-center';
          } else if (route.name === 'Cardio') {
            iconName = 'directions-run';
          } else if (route.name === 'Meals') {
            iconName = 'restaurant';
          } else if (route.name === 'Water') {
            iconName = 'water-drop';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Workout">
        {() => <WorkoutScreen date={date} userId={userId}/>}
      </Tab.Screen>
      <Tab.Screen name="Cardio">
        {() => <CardioScreen date={date} userId={userId}/>}
      </Tab.Screen>
      <Tab.Screen name="Meals">
        {() => <MealScreen date={date} userId={userId}/>}
      </Tab.Screen>
      <Tab.Screen name="Water">
        {() => <WaterScreen date={date} userId={userId}/>}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
