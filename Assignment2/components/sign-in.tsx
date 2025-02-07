import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
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
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none" // Prevent automatic capitalization
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry // Hide password input
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Explicit color naming
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Added padding for better spacing
  },
  input: {
    height: 40,
    marginVertical: 8, // More consistent spacing
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '80%', // Responsive width
    borderColor: '#ccc', // Subtle border color
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20, // Added spacing below title
  },
});

export default SignIn;
