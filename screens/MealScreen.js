import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebase } from '../utils/firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';

export default function MealScreen({ date}) {
  const navigation = useNavigation();
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  useEffect(() => {
    loadMeals();
  }, [date]);

  const STORAGE_KEY = `meals-${firebase.auth().currentUser.uid}-${date}`;

  const loadMeals = async () => {
    try {
      const userId = firebase.auth().currentUser.uid;
      const snapshot = await firebase
        .database()
        .ref(`users/${userId}/logs/meals/${date}`)
        .once('value');

      if (snapshot.exists()) {
        const data = snapshot.val();
        setMeals(data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        setMeals([]);
      }
    } catch (error) {
    }
  };

  const saveMeals = async (newMeals) => {
    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase
        .database()
        .ref(`users/${userId}/logs/meals/${date}`)
        .set(newMeals);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMeals));
    } catch (error) {
    }
  };

  const addMeal = () => {
    if (!mealName || !calories || !protein || !carbs || !fats) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const newMeal = {
      name: mealName,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fats: parseFloat(fats),
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    saveMeals(updatedMeals);

    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  const deleteMeal = (index) => {
    const updatedMeals = meals.filter((_, i) => i !== index);
    setMeals(updatedMeals);
    saveMeals(updatedMeals);
  };

  const editMeal = (index) => {
    const mealToEdit = meals[index];
    setMealName(mealToEdit.name);
    setCalories(mealToEdit.calories.toString());
    setProtein(mealToEdit.protein.toString());
    setCarbs(mealToEdit.carbs.toString());
    setFats(mealToEdit.fats.toString());

    deleteMeal(index);
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

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

          <Text style={styles.heading}>🍽 Meals for {date}</Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Total Calories: {totalCalories} kcal</Text>
            <Text style={styles.summaryText}>Protein: {totalProtein}g</Text>
            <Text style={styles.summaryText}>Carbs: {totalCarbs}g</Text>
            <Text style={styles.summaryText}>Fats: {totalFats}g</Text>
          </View>

          {/* Input Fields */}
          <TextInput
            placeholder="Meal Name"
            style={styles.input}
            value={mealName}
            onChangeText={setMealName}
          />
          <TextInput
            placeholder="Calories"
            style={styles.input}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Protein (g)"
            style={styles.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Carbs (g)"
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Fats (g)"
            style={styles.input}
            value={fats}
            onChangeText={setFats}
            keyboardType="numeric"
          />
          <Button title="Add Meal" onPress={addMeal} color="#4caf50" />

          {/* Meals List */}
          {meals.length === 0 && (
            <Text style={styles.noMealsText}>No meals logged for this date.</Text>
          )}

          {meals.map((item, index) => (
            <View key={index} style={styles.mealItem}>
              <View>
                <Text style={styles.mealText}>
                  {item.name} - {item.calories} kcal
                </Text>
                <Text style={styles.macroText}>
                  P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => editMeal(index)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMeal(index)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, paddingBottom: 50 },
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
    marginTop: 50, // space for back arrow
    marginBottom: 10,
    textAlign: 'center',
    color: '#4caf50',
  },
  summaryContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  summaryText: { fontSize: 16, marginVertical: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginVertical: 5,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mealText: { fontSize: 16 },
  macroText: { fontSize: 14, color: '#666' },
  noMealsText: { textAlign: 'center', marginTop: 20, color: '#999' },
  deleteButton: { color: 'red', marginLeft: 10 },
  editButton: { color: '#4caf50', marginRight: 10 },
});
