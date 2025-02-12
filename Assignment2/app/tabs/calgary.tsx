import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Image,
} from "react-native";
import { ThemedText, ThemedView } from "../../components/ThemedComponents";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";

interface CityTabProps {
    city: string;
    imageUrl: string;
    link: string;
}

const CityTab: React.FC<CityTabProps> = ({ city, imageUrl, link }) => {
    const router = useRouter();

    return (
        <View style={styles.cityContainer}>
            <Text style={styles.cityText}>{city}</Text>
            <Image source={{ uri: imageUrl }} style={styles.cityImage} />
            <TouchableOpacity
                onPress={() => router.push(`/${link.toLowerCase()}`)}
            >
                <Text style={styles.linkText}>Go to {city} page</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function Calgary() {
    const { username } = useLocalSearchParams();

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedText type="title" style={styles.sectionTitle}>
                    Welcome to Calgary, {username}
                </ThemedText>
                <CityTab
                    city="Calgary"
                    imageUrl="https://www.toniagara.com/blog/wp-content/uploads/2023/12/Calgary-Skyline-at-Dusk.jpg"
                    link="tabs/calgary"
                />
                <ThemedText type="default" style={styles.listItem}>
                    Calgary is a vibrant city in the province of Alberta,
                    Canada. It is known for its friendly people, beautiful
                    parks, and world-class attractions.
                </ThemedText>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Heart of the New West
                </ThemedText>

                {/* City Attractions */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    City Attractions:
                </ThemedText>
                {[
                    "Calgary Tower",
                    "Calgary Zoo",
                    "Canada Olympic Park",
                    "Glenbow Museum",
                    "Heritage Park Historical Village",
                    "Prince's Island Park",
                    "TELUS Spark",
                    "Calgary Stampede",
                    "Calgary Philharmonic Orchestra",
                    "Calgary Opera",
                    "Calgary Flames",
                    "Calgary Stampeders",
                    "Calgary Hitmen",
                    "Calgary Roughnecks",
                ].map((attraction, index) => (
                    <ThemedText
                        key={index}
                        type="default"
                        style={styles.listItem}
                    >
                        • {attraction}
                    </ThemedText>
                ))}

                {/* Climate Section */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Climate:
                </ThemedText>
                <ThemedText type="default" style={styles.listItem}>
                    Calgary has a humid continental climate with warm summers
                    and cold winters. The city experiences a wide range of
                    weather conditions, from sunny days to heavy snowfall.
                    Calgary is known for its famous Chinooks, warm winds that
                    can raise temperatures dramatically in the winter.
                </ThemedText>

                {/* Economic Facts Section */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Economic Facts:
                </ThemedText>
                <ThemedText type="default" style={styles.listItem}>
                    Calgary is a major economic center in Alberta, with strong
                    industries in energy, finance, technology, and
                    transportation. The city is home to the headquarters of many
                    oil and gas companies, as well as major financial
                    institutions. Calgary is known for its entrepreneurial
                    spirit and innovative business community.
                </ThemedText>
                {/* Back to Welcome Page Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                        Linking.openURL("https://www.calgary.ca/home.html")
                    }
                >
                    <ThemedText style={styles.buttonText}>
                        Calgary Website
                    </ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    welcomeText: {
        fontSize: 26,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20, // Space between the welcome message and city cards
    },
    cityContainer: {
        marginVertical: 10,
        alignItems: "center",
        backgroundColor: "#3d2c8d",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
        width: 300,
    },
    cityText: {
        fontSize: 22,
        fontWeight: "500",
        color: "white",
        marginBottom: 5,
    },
    cityImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    linkText: {
        fontSize: 18,
        color: "#fff",
    },

    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#6d597a", // Soft white background for a modern look
    },
    scrollContent: {
        padding: 20,
        alignItems: "center", // Center content for a balanced layout
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff", // Primary purple for contrast
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    listItem: {
        fontSize: 16,
        color: "#fff", // Dark purple text for readability
        backgroundColor: "#F4A261", // Orange highlight for list items
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
        backgroundColor: "#f4a261", // Primary purple
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
