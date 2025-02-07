import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type WelcomeProps = {username: string};
const Welcome: React.FC<WelcomeProps> = ({username}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome {username} to my app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Welcome;