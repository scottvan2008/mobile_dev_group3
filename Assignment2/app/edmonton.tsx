
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '../components/ThemedComponents';
import { useRouter } from 'expo-router';

export default function Edmonton() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.sectionTitle}>Welcome to Edmonton</ThemedText>
        <ThemedText type="default" style={styles.listItem}>
          Edmonton is the capital city of Alberta, Canada. It is known for its
          rich history and diverse culture.
        </ThemedText>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Industry, Integrity, Progress</ThemedText>

        {/* City Attractions */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          City Attractions:
        </ThemedText>
        {[
          'City Hall',
          'Churchill Square & City Hall Plaza',
          'Downtown Edmonton',
          'Edmonton Valley Zoo',
          'Fort Edmonton Park',
          'John Janzen Nature Centre',
          'Muttart Conservatory',
          'City Arts Centre',
          'John Walter Museum',
          'Prince of Wales Armouries',
          'Clarke Stadium',
          'Commonwealth Stadium',
          'Edmonton EXPO Centre',
          'RE/MAX Field',
        ].map((attraction, index) => (
          <ThemedText key={index} type="default" style={styles.listItem}>
            • {attraction}
          </ThemedText>
        ))}

        {/* Climate Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Climate:
        </ThemedText>
        <ThemedText type="default" style={styles.listItem}>
          Edmonton experiences a humid continental climate with cold winters and warm summers.
          The city enjoys long daylight hours during the summer, while winters can be snowy
          with temperatures often dropping below freezing.
        </ThemedText>

        {/* Economic Facts Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Economic Facts:
        </ThemedText>
        <ThemedText type="default" style={styles.listItem}>
          Edmonton is a key economic hub in Alberta, with strong industries in oil and gas,
          technology, healthcare, and education. The city has a growing tech sector, supported
          by a vibrant entrepreneurial ecosystem and major research institutions like the
          University of Alberta.
        </ThemedText>

        {/* Back to Welcome Page Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('./welcome')}>
          <ThemedText style={styles.buttonText}>Back to Welcome Page</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: "#6d597a", // Purple background
  },
  scrollContent: {
    padding: 20,
    alignItems: "center", // Center content for a balanced layout
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff", // White for contrast
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  listItem: {
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#F4A261", // Orange highlight
    padding: 10,
    borderRadius: 10,
    width: "100%",
    textAlign: "center",
    marginVertical: 5,
  },
  button: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f4a261", // Orange button
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Adds depth on Android
  },
  buttonText: {
    color: "#FDF8F5",
    fontSize: 18,
    fontWeight: "bold",
  },
});
