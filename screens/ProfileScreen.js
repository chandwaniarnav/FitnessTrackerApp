import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebase } from '../utils/firebaseConfig';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      const currentUser = firebase.auth().currentUser;

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setProfileFields(profile);
      } else {
        const doc = await firebase
          .firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (doc.exists) {
          const firestoreProfile = doc.data();
          setProfileFields(firestoreProfile);
          await AsyncStorage.setItem(
            'userProfile',
            JSON.stringify(firestoreProfile)
          );
        }
      }

      if (currentUser?.email) setEmail(currentUser.email);
    } catch (error) {
    }
  };

  const setProfileFields = (profile) => {
    setName(profile.name || '');
    setAge(profile.age ? profile.age.toString() : '');
    setWeight(profile.weight ? profile.weight.toString() : '');
    setHeight(profile.height ? profile.height.toString() : '');
  };

  const saveProfile = async () => {
    if (!name || !age || !weight || !height) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    const profile = {
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
    };
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await firebase
        .database()
        .ref(`/users/${firebase.auth().currentUser.uid}`)
        .set(profile);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      await firebase.auth().signOut();
    } catch (e) {
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>👤 Your Profile</Text>
          <Text style={styles.emailText}>Email: {email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.buttonText}>💾 Save Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#4caf50',
  },
  emailText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
