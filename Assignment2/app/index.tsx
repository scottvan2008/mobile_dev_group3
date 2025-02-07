import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Sign_in from '../components/sign-in';
import Welcome from '../components/welcome';

export default function App() {
  return (
    <View style={styles.container}>
      <Sign_in/>
      <Welcome/>
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
