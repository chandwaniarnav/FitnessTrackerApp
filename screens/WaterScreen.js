import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebase } from '../utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';

export default function WaterScreen({ date}) {
  const navigation = useNavigation();
  const [waterLogs, setWaterLogs] = useState([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadWaterLogs();
  }, [date]);

  const STORAGE_KEY = `water-${firebase.auth().currentUser.uid}-${date}`;

  const loadWaterLogs = async () => {
    try {
      const userId = firebase.auth().currentUser.uid;
      const snapshot = await firebase
        .database()
        .ref(`users/${userId}/logs/water/${date}`)
        .once('value');

      if (snapshot.exists()) {
        const data = snapshot.val();
        setWaterLogs(data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        setWaterLogs([]);
      }
    } catch (error) {
    }
  };

  const saveWaterLogs = async (newLogs) => {
    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase
        .database()
        .ref(`users/${userId}/logs/water/${date}`)
        .set(newLogs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    } catch (error) {
    }
  };

  const addWater = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid amount in ml.');
      return;
    }

    const newLog = { amount: parseFloat(amount) };
    const updatedLogs = [...waterLogs, newLog];
    setWaterLogs(updatedLogs);
    saveWaterLogs(updatedLogs);
    setAmount('');
  };

  const deleteWaterLog = (index) => {
    const updatedLogs = waterLogs.filter((_, i) => i !== index);
    setWaterLogs(updatedLogs);
    saveWaterLogs(updatedLogs);
  };

  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.heading}>💧 Water Intake for {date}</Text>
          <Text style={styles.totalText}>Total: {totalWater} ml</Text>

          <TextInput
            placeholder="Enter amount (ml)"
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />
          <Button title="Add Water" onPress={addWater} color="#4caf50" />

          {waterLogs.length === 0 ? (
            <Text style={styles.noLogsText}>No water logged for this date.</Text>
          ) : (
            waterLogs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logText}>{log.amount} ml</Text>
                <TouchableOpacity onPress={() => deleteWaterLog(index)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
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
    marginBottom: 10,
    textAlign: 'center',
    color: '#2196f3',
  },
  totalText: { fontSize: 16, marginBottom: 10, color: '#4caf50', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  logText: { fontSize: 16 },
  deleteButton: { color: 'red' },
  noLogsText: { textAlign: 'center', marginTop: 20, color: '#999' },
});
