import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define the type for props
interface WelcomeProps {
  username: string;
}

// Functional component that displays a welcome message
const Welcome: React.FC<WelcomeProps> = ({ username }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}! 🎉</Text>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: '#f8f9fa', // Light gray background for better contrast
  },
  welcomeText: {
    fontSize: 26, // Slightly larger text size for emphasis
    fontWeight: '600', // Semi-bold for a modern look
    color: '#333', // Darker text color for readability
    textAlign: 'center', // Center align text
    paddingHorizontal: 20, // Add some spacing on the sides
  },
});

export default Welcome;