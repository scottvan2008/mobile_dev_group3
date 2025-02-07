import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Sign_in from '../components/sign-in';
import Welcome from '../components/welcome';
import { useState } from 'react';
import credentials from '../credentials.json';

export default function App() {

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");



  return (
    <View style={styles.container}>
      {isSignedIn ? (
        <Welcome username={username} /> 
        ): (
          <Sign_in 
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
