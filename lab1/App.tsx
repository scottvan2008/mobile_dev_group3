import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { destination, vacation_price } from './app/vacation'; // Importing functions from another module
import { useState } from 'react';

// Define some color constants
const color1 = "#72A0C1";
const color2 = "#F9F8F8";

export default function App() {
  // Define a state variable to track the color
  const [color, setcolor] = useState(color1);

  // TypeScript type definitions for person and address
  type Person = { name: string; age: number; isEmployed: boolean };
  type PersonType2 = {
    name: string;
    age: number;
    isEmployed: boolean;
    address?: Address;
    destination?: string;
    price?: number;
  };

  interface Address {
    street: string;
    city: string;
    state: string;
    apartment?: number;
  }

  // Sample data for demonstration purposes
  const name: string = "John Doe NONONO";
  let occupation: string = "Software Developer";
  const age: number = 30;
  const isEmployed: boolean = true;
  const hobbies: string[] = ["Reading", "Swimming", "Coding"];
  const scores: number[] = [10, 20, 30, 40, 50];
  const mixed_values: any[] = [10, "John Doe", true];
  const address: { street: string; city: string } = {
    street: "123 Main St",
    city: "New York",
  };

  // Person objects
  const person1: Person = {
    name: "Jane Doe",
    age: 30,
    isEmployed: true,
  };

  const person2: PersonType2 = {
    name, // Use the predefined name variable
    age,  // Use the predefined age variable
    isEmployed, // Use the predefined isEmployed variable
    address: { street: "123 Main St", city: "New York", state: "NY", apartment: 3 },
    destination: destination("Hawaii"), // Call imported function
    price: vacation_price("Hawaii", 7), // Call imported function
  };

  // Array containing both types of people
  const people: (Person | PersonType2)[] = [person1, person2];

  return (
    <View style={styles.container}>
      {/* Display welcome message with the name */}
      <View>
        <Text style={styles.title}>Welcome {person2.name}</Text>
      </View>

      {/* Display travel destination and cost */}
      <View>
        <Text style={{ color: color }}>
          You are going to {person2.destination}, it will cost you {person2.price}
        </Text>
      </View>

      {/* Button to reset color */}
      <View>
        <TouchableOpacity
          onPress={() => {
            setcolor("#72A0C1"); // Reset color to default
          }}
        >
          <Text>Click Me</Text>
        </TouchableOpacity>
      </View>

      {/* Added "Alert" button */}
      <View style={styles.alertButtonContainer}>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => Alert.alert("Alert", "Alert Button pressed")} // Show alert on button press
        >
          <Text style={styles.alertButtonText}>Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Status bar for device status */}
      <StatusBar style="auto" />
    </View>
  );
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1, // Full screen height
    backgroundColor: '#fff', // Background color
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
    padding: 20, // Add some padding
  },
  title: {
    fontSize: 30, // Large font for the title
    fontWeight: 'bold', // Bold text
  },
  text: {
    fontSize: 16, // Standard font size
    margin: 10, // Add margin around text
    color: '#72A0C1', // Custom color
  },
  alertButtonContainer: {
    marginTop: 20, // Space between this and the previous content
  },
  alertButton: {
    backgroundColor: '#72A0C1', // Button background color
    padding: 10, // Padding inside the button
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center button text
  },
  alertButtonText: {
    color: '#fff', // White text color
    fontSize: 16, // Standard font size for button text
    fontWeight: 'bold', // Bold text
  },
});
