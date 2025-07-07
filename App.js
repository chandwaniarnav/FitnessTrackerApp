import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { firebase } from './utils/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CalendarScreen from './screens/CalendarScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import DayDetailsScreen from './screens/DayDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import WaterScreen from './screens/WaterScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import MealScreen from './screens/MealScreen';
import CardioScreen from './screens/CardioScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          // Clear cache profile
          await AsyncStorage.removeItem('userProfile');
          const snapshot = await firebase
            .database()
            .ref(`/users/${user.uid}/profile`) // Fetch from database
            .once('value');

          if (snapshot.exists()) {
            const profile = snapshot.val();
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        } catch (e) {
          setProfileComplete(false);
        }
      } else {
        // Clear cache on logout
        await AsyncStorage.clear();
        setProfileComplete(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !profileComplete ? (
          <Stack.Screen name="CompleteProfile">
            {(props) => (
              <CompleteProfileScreen
                {...props}
                onProfileComplete={() => setProfileComplete(true)} // Pass callback
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="DayDetails" component={DayDetailsScreen} />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Water" component={WaterScreen} />
            <Stack.Screen name="Cardio" component={CardioScreen} />
            <Stack.Screen name="Meal" component={MealScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
