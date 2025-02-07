import { View, Text, StyleSheet } from 'react-native';

export default function Edmonton() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Edmonton</Text>
      <Text style={styles.description}>
        Industry, Integrity, Progress
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});
