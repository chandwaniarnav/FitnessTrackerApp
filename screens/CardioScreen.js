import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { firebase } from '../utils/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function CardioScreen({ date}) {
  const navigation = useNavigation();
  const [cardioData, setCardioData] = useState({
    distance: '',
    duration: '',
    calories: '',
  });

  useEffect(() => {
    loadCardioData();
  }, [date]);

  const STORAGE_KEY = `cardio-${firebase.auth().currentUser.uid}-${date}`;

  const loadCardioData = async () => {
    try {
      const userId = firebase.auth().currentUser.uid;
      const snapshot = await firebase
        .database()
        .ref(`users/${userId}/logs/cardio/${date}`)
        .once('value');

      if (snapshot.exists()) {
        const data = snapshot.val();
        setCardioData(data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        setCardioData({ distance: '', duration: '', calories: '' });
      }
    } catch (error) {
    }
  };

  const saveCardioData = async () => {
    const { distance, duration, calories } = cardioData;

    if (!distance || !duration || !calories) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }

    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase
        .database()
        .ref(`users/${userId}/logs/cardio/${date}`)
        .set(cardioData);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cardioData));
      Alert.alert('Success', 'Cardio log saved!');
    } catch (error) {
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.heading}>🏃 Cardio for {date}</Text>

          <TextInput
            placeholder="Distance (km)"
            style={styles.input}
            keyboardType="numeric"
            value={cardioData.distance}
            onChangeText={(text) =>
              setCardioData({ ...cardioData, distance: text })
            }
          />
          <TextInput
            placeholder="Duration (minutes)"
            style={styles.input}
            keyboardType="numeric"
            value={cardioData.duration}
            onChangeText={(text) =>
              setCardioData({ ...cardioData, duration: text })
            }
          />
          <TextInput
            placeholder="Calories Burned"
            style={styles.input}
            keyboardType="numeric"
            value={cardioData.calories}
            onChangeText={(text) =>
              setCardioData({ ...cardioData, calories: text })
            }
          />

          <Button title="Save Cardio" onPress={saveCardioData} color="#4caf50" />

          {cardioData.distance !== '' && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>📊 Summary</Text>
              <Text style={styles.summaryDetail}>
                Distance: {cardioData.distance} km
              </Text>
              <Text style={styles.summaryDetail}>
                Duration: {cardioData.duration} min
              </Text>
              <Text style={styles.summaryDetail}>
                Calories: {cardioData.calories} kcal
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 50, 
    marginBottom: 15,
    textAlign: 'center',
    color: '#4caf50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4caf50',
  },
  summaryDetail: { fontSize: 16, marginVertical: 2 },
});
