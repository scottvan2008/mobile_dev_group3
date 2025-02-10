import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '../components/ThemedComponents';
import { useRouter } from 'expo-router';


export default function Calgary() {

    const router = useRouter();


    return (
        <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText type="title">Welcome to Calgary</ThemedText>
            <ThemedText type="default">
            Calgary is a vibrant city in the province of Alberta, Canada. It is known for its
            friendly people, beautiful parks, and world-class attractions.
            </ThemedText>
            <ThemedText type="subtitle">Heart of the New West</ThemedText>

            {/* City Attractions */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
            City Attractions:
            </ThemedText>
            {[
            'Calgary Tower',
            'Calgary Zoo',
            'Canada Olympic Park',
            'Glenbow Museum',
            'Heritage Park Historical Village',
            'Prince\'s Island Park',
            'TELUS Spark',
            'Calgary Stampede',
            'Calgary Philharmonic Orchestra',
            'Calgary Opera',
            'Calgary Flames',
            'Calgary Stampeders',
            'Calgary Hitmen',
            'Calgary Roughnecks',
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
            Calgary has a humid continental climate with warm summers and cold winters.
            The city experiences a wide range of weather conditions, from sunny days to
            heavy snowfall. Calgary is known for its famous Chinooks, warm winds that
            can raise temperatures dramatically in the winter.
            </ThemedText>

            {/* Economic Facts Section */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>
            Economic Facts:
            </ThemedText>
            <ThemedText type="default">
            Calgary is a major economic center in Alberta, with strong industries in
            energy, finance, technology, and transportation. The city is home to the
            headquarters of many oil and gas companies, as well as major financial
            institutions. Calgary is known for its entrepreneurial spirit and innovative
            business community.
            </ThemedText>

            {/* Back to Welcome Page Button */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => router.back()} // This will trigger the rendering of the Welcome page
                >
            <ThemedText style={styles.buttonText}>Back to Welcome Page</ThemedText>
            </TouchableOpacity>

        </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    sectionTitle: {
        marginTop: 16,
    },
    listItem: {
        marginTop: 4,
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