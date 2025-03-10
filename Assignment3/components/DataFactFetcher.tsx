import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Picker } from "@react-native-picker/picker";

const DateFactFetcher: React.FC = () => {
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<string>("");
  const [fact, setFact] = useState<string>("");

  const fetchFact = async (selectedMonth: number, selectedDay: number) => {
    try {
      const response = await fetch(
        `https://numbersapi.p.rapidapi.com/${selectedMonth}/${selectedDay}/date`,
        {
          method: "GET",
          headers: {
           'x-rapidapi-key': 'f7ad52a4c9msh6a9e22b30920ea7p1cde70jsn276e86088ed0',
            "X-RapidAPI-Host": "numbersapi.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.text();
      setFact(data);
    } catch (error) {
      console.error("Error fetching fact:", error);
      Alert.alert("Error", "Could not fetch the fact. Check your API key or internet connection.");
    }
  };

  useEffect(() => {
    const monthNum = month;
    const dayNum = parseInt(day, 10);
    if (monthNum !== null && dayNum >= 1 && dayNum <= 31) {
      fetchFact(monthNum, dayNum);
    }
  }, [month, day]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interesting Facts</Text>


      {fact ? <Text style={styles.factText}>{fact}</Text> : null}

      {/* Day Input Above Picker */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter day (1-31)"
          maxLength={2}
          onChangeText={(value) => setDay(value)}
          value={day}
          returnKeyLabel="Done"
        />
      </View>
        </TouchableWithoutFeedback>

        <Picker
          selectedValue={month}
          style={styles.picker}
          onValueChange={(itemValue) => setMonth(itemValue)}
        >
          <Picker.Item label="Select a month" value={null} />
          <Picker.Item label="January" value={1} />
          <Picker.Item label="February" value={2} />
          <Picker.Item label="March" value={3} />
          <Picker.Item label="April" value={4} />
          <Picker.Item label="May" value={5} />
          <Picker.Item label="June" value={6} />
          <Picker.Item label="July" value={7} />
          <Picker.Item label="August" value={8} />
          <Picker.Item label="September" value={9} />
          <Picker.Item label="October" value={10} />
          <Picker.Item label="November" value={11} />
          <Picker.Item label="December" value={12} />
        </Picker>
      </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  factText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: "80%",
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10, // Added margin to separate from Picker
  },
  picker: {
    width: "100%",
    height: 50,
  },
});

export default DateFactFetcher;
