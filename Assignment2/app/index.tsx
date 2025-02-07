import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SignIn from '../components/sign-in'; // Ensure consistent naming convention
import Welcome from '../components/welcome';

export default function App() {
  // State to track user authentication status
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  // State to store the username
  const [username, setUsername] = useState<string>("");

  return (
    <View style={styles.container}>
      {/* Render Welcome component if signed in, otherwise render SignIn component */}
      {isSignedIn ? (
        <Welcome username={username} />
      ) : (
        <SignIn 
          setIsSignedIn={setIsSignedIn} 
          username={username} 
          setUsername={setUsername} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Explicit color naming for readability
    alignItems: 'center',
    justifyContent: 'center',
  },
});
