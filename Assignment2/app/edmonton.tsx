import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '../components/ThemedComponents';
import { useRouter } from 'expo-router';
import Welcome from './welcome';

export default function Edmonton() {

  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title">Welcome to Edmonton</ThemedText>
        <ThemedText type="default">
          Edmonton is the capital city of Alberta, Canada. It is known for its
          rich history and diverse culture.
        </ThemedText>
        <ThemedText type="subtitle">Industry, Integrity, Progress</ThemedText>

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
        <ThemedText type="default">
          Edmonton experiences a humid continental climate with cold winters and warm summers.
          The city enjoys long daylight hours during the summer, while winters can be snowy
          with temperatures often dropping below freezing.
        </ThemedText>

        {/* Economic Facts Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Economic Facts:
        </ThemedText>
        <ThemedText type="default">
          Edmonton is a key economic hub in Alberta, with strong industries in oil and gas,
          technology, healthcare, and education. The city has a growing tech sector, supported
          by a vibrant entrepreneurial ecosystem and major research institutions like the
          University of Alberta.
        </ThemedText>


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
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  scrollContent: {
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    color: '#007bff',
  },
  listItem: {
    textAlign: 'left',
    width: '100%',
    paddingLeft: 10,
    marginBottom: 4,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
},
buttonText: {
    color: '#fff',
    fontWeight: 'bold',
},
});
