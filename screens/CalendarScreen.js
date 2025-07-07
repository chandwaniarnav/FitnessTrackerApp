import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firebase } from '../utils/firebaseConfig';

export default function CalendarScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    setMarkedDates({
      [today]: {
        selected: true,
        selectedColor: '#4caf50',
        marked: true,
        dotColor: '#4caf50',
      },
    });
  }, []);

  const onDayPress = (day) => {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    if (day.dateString > today) {
      Alert.alert("Invalid", "You cannot select a future date!");
      return;
    }

   navigation.navigate('DayDetails', {
  date: day.dateString,
  userId: firebase.auth().currentUser.uid, // pass UID
});
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#4caf50',
          todayTextColor: '#4caf50',
          arrowColor: '#4caf50',
          dotColor: '#4caf50',
          textSectionTitleColor: '#4caf50',
          selectedDayTextColor: '#fff',
          monthTextColor: '#4caf50',
          indicatorColor: '#4caf50',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  calendar: {
    marginHorizontal: 10,
  },
});
