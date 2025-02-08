import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import credentials from '../credentials.json';

// Define the props for the SignIn component
type SignInProps = {
  setIsSignedIn: (isSignedIn: boolean) => void;
  username: string;
  setUsername: (username: string) => void;
};

const SignIn: React.FC<SignInProps> = ({ setIsSignedIn, username, setUsername }) => {
  // State to handle password input
  const [password, setPassword] = useState<string>("");

  // Function to handle login logic
  const handleLogin = () => {
    const user = credentials.users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      setIsSignedIn(true);
    } else {
      alert("Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#fff"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none" // Prevent automatic capitalization
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Hide password input
      />
      
      {/* Custom TouchableOpacity button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%", // Full width
    backgroundColor: "#F4A261", // Muted orange background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",  // Full width
    backgroundColor: "#E76F51", // Slightly darker shade for input
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",  // Full width button
    backgroundColor: "#6D597A", // Muted purple
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#fff",
    marginBottom: 20, // Added spacing below title
  },
});

export default SignIn;
