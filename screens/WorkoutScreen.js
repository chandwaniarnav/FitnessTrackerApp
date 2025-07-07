import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../utils/firebaseConfig';
import { useNavigation } from '@react-navigation/native';


export default function WorkoutScreen({ date }) {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const [exerciseName, setExerciseName] = useState('');
  const [numSets, setNumSets] = useState(0);
  const [setsData, setSetsData] = useState([]);

  const STORAGE_KEY = `workout-${firebase.auth().currentUser.uid}-${date}`;

  // Load saved workout logs for the selected date
  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const userId = firebase.auth().currentUser.uid;
        const snapshot = await firebase
          .database()
          .ref(`users/${userId}/logs/workouts/${date}`)
          .once('value');

        if (snapshot.exists()) {
          const data = snapshot.val();
          setExercises(data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          setExercises([]);
        }
      } catch (err) {
      }
      setIsLoading(false);
    };
    loadWorkout();
  }, [date]);

  // Save workouts to Firebase and AsyncStorage
  const saveWorkoutToStorage = async (data) => {
    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase
        .database()
        .ref(`users/${userId}/logs/workouts/${date}`)
        .set(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
    }
  };

  const handleEditExercise = (index) => {
    const selectedExercise = exercises[index];
    setExerciseName(selectedExercise.name);
    setNumSets(selectedExercise.sets.length);
    setSetsData([...selectedExercise.sets]);
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDeleteExercise = async (index) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedExercises = exercises.filter((_, i) => i !== index);
            setExercises(updatedExercises);
            await saveWorkoutToStorage(updatedExercises);
          },
        },
      ]
    );
  };

  const saveExercise = async () => {
    if (!exerciseName || setsData.some(set => !set.reps || !set.weight)) {
      Alert.alert("Incomplete Data", "Please fill in all fields before saving.");
      return;
    }

    let updatedExercises = [...exercises];

    if (isEditing && editingIndex >= 0) {
      updatedExercises[editingIndex] = {
        name: exerciseName,
        sets: setsData,
      };
    } else {
      updatedExercises.push({
        name: exerciseName,
        sets: setsData,
      });
    }

    setExercises(updatedExercises);
    await saveWorkoutToStorage(updatedExercises);

    setExerciseName('');
    setNumSets(0);
    setSetsData([]);
    setIsEditing(false);
    setEditingIndex(-1);
  };

  const handleSetDataChange = (index, field, value) => {
    const updatedSets = [...setsData];
    updatedSets[index] = { ...updatedSets[index], [field]: value };
    setSetsData(updatedSets);
  };

  const handleAddNewExercise = () => {
    setExerciseName('');
    setNumSets(0);
    setSetsData([]);
    setIsEditing(true);
    setEditingIndex(-1);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading workout...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Back Arrow */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>🏋️ Workout for {date}</Text>

            {exercises.length === 0 && (
              <Text style={styles.noWorkoutText}>No workout logged for this day.</Text>
            )}

            {/* Existing workout summary */}
            {exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseSummary}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                {ex.sets.map((set, sIdx) => (
                  <Text key={sIdx} style={styles.setSummary}>
                    Set {sIdx + 1}: {set.reps} reps @ {set.weight}kg
                  </Text>
                ))}
                <View style={styles.actionButtons}>
                  <Button
                    title="Edit"
                    onPress={() => handleEditExercise(idx)}
                    color="#4caf50"
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteExercise(idx)}
                    color="#f44336"
                  />
                </View>
              </View>
            ))}

            {/* Add/Edit exercise form */}
            {isEditing && (
              <>
                <Text style={styles.subtitle}>
                  {editingIndex >= 0 ? "Edit Exercise" : "Add New Exercise"}
                </Text>

                <TextInput
                  placeholder="Exercise Name"
                  value={exerciseName}
                  onChangeText={setExerciseName}
                  style={styles.input}
                />

                <Text style={styles.label}>Select number of sets:</Text>
                <RNPickerSelect
                  onValueChange={(value) => {
                    setNumSets(value);
                    const setsArray = Array.from({ length: value }, () => ({
                      reps: '',
                      weight: '',
                    }));
                    setSetsData(setsArray);
                  }}
                  value={numSets}
                  placeholder={{ label: "Select sets", value: null }}
                  items={[1, 2, 3, 4, 5].map((n) => ({ label: `${n}`, value: n }))}
                  style={{ inputAndroid: { color: 'black' } }}
                />

                {numSets > 0 && (
                  <>
                    <Text style={styles.subtitle}>Enter reps & weight for each set:</Text>
                    {setsData.map((set, index) => (
                      <View key={index} style={styles.setBlock}>
                        <Text>Set {index + 1}</Text>
                        <TextInput
                          placeholder="Reps"
                          keyboardType="numeric"
                          value={set.reps}
                          onChangeText={(text) =>
                            handleSetDataChange(index, 'reps', text)
                          }
                          style={styles.input}
                        />
                        <TextInput
                          placeholder="Weight (kg)"
                          keyboardType="numeric"
                          value={set.weight}
                          onChangeText={(text) =>
                            handleSetDataChange(index, 'weight', text)
                          }
                          style={styles.input}
                        />
                      </View>
                    ))}
                  </>
                )}

                <Button
                  title={editingIndex >= 0 ? "Update Exercise" : "Save Exercise"}
                  onPress={saveExercise}
                  color="#4caf50"
                />
              </>
            )}

            {/* Button to Add New Exercise */}
            {!isEditing && (
              <View style={{ marginTop: 15 }}>
                <Button
                  title="Add New Exercise"
                  onPress={handleAddNewExercise}
                  color="#2196f3"
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 50, marginBottom: 10, textAlign: 'center', color: '#2196f3' },
  subtitle: { fontSize: 16, marginVertical: 8 },
  label: { fontSize: 16, marginVertical: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', marginVertical: 5, padding: 8, borderRadius: 5 },
  setBlock: { marginVertical: 8, padding: 5, backgroundColor: '#f9f9f9', borderRadius: 5 },
  noWorkoutText: { fontSize: 16, fontStyle: 'italic', marginVertical: 10, color: '#999' },
  exerciseSummary: { marginVertical: 10, backgroundColor: '#eee', padding: 10, borderRadius: 5 },
  exerciseName: { fontWeight: 'bold', fontSize: 16 },
  setSummary: { marginLeft: 10, fontSize: 14 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
});
