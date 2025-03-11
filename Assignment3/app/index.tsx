import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Date Facts</Text>
            <Button
                title="Get Date Facts"
                onPress={() => router.push("/api")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
