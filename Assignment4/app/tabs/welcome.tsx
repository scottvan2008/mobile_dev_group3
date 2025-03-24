import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { supabase } from "../../src/supabase";
import { useRouter } from "expo-router";

const Welcome: React.FC = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState<string>("");
    const [newFirstName, setNewFirstName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch user details on mount
    useEffect(() => {
        const fetchUserDetails = async () => {
            const { data: userData, error: userError } =
                await supabase.auth.getUser();
            if (userError || !userData.user) {
                Alert.alert("Error", "Unable to fetch user data.");
                router.push("/");
                return;
            }

            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userData.user.id)
                .single();

            if (error || !data) {
                Alert.alert("Error", "Unable to fetch user details.");
            } else {
                setFullName(`${data.first_name} ${data.last_name}`);
            }
            setLoading(false);
        };

        fetchUserDetails();
    }, []);

    // Logout handler
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Error", "Failed to sign out.");
            return;
        }
        router.push("/");
    };

    // Update user's first name with input
    const handleUpdateName = async () => {
        if (!newFirstName || newFirstName.trim().length < 2) {
            Alert.alert(
                "Invalid Name",
                "Please enter a first name with at least 2 characters."
            );
            return;
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        setLoading(true);

        const { error } = await supabase
            .from("user_details")
            .update({ first_name: newFirstName.trim() })
            .eq("uuid", userData.user.id);

        setLoading(false);

        if (error) {
            Alert.alert(
                "Update Failed",
                "Unable to update your name. Please try again."
            );
        } else {
            setFullName(`${newFirstName.trim()} ${fullName.split(" ")[1]}`);
            setNewFirstName(""); // Clear input after success
            Alert.alert("Success", "Your name has been updated successfully!");
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3182CE" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.nameText}>{fullName}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Your Profile</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>New First Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new first name"
                            placeholderTextColor="#A0AEC0"
                            value={newFirstName}
                            onChangeText={setNewFirstName}
                            autoCapitalize="words"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdateName}
                    >
                        <Text style={styles.updateButtonText}>Update Name</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBF8FF", // Light blue background
        padding: 20,
        width: "100%",
    },
    card: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#4299E1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        color: "#4A5568",
        marginBottom: 4,
    },
    nameText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2B6CB0", // Darker blue for name
        textAlign: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#E2E8F0",
        marginVertical: 20,
        width: "100%",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4A5568",
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
        width: "100%",
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
        marginBottom: 6,
    },
    input: {
        width: "100%",
        backgroundColor: "#F7FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: "#2D3748",
    },
    updateButton: {
        backgroundColor: "#3182CE", // Primary blue
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        width: "100%",
    },
    updateButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: "#EBF8FF", // Light blue background
        borderWidth: 1,
        borderColor: "#3182CE",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        width: "100%",
    },
    logoutButtonText: {
        color: "#3182CE", // Blue text
        fontSize: 16,
        fontWeight: "600",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#4A5568",
    },
});

export default Welcome;
