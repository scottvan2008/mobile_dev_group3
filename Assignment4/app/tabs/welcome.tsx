import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../../src/supabase";
import { useRouter } from "expo-router";

const Welcome: React.FC = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState<string>(""); // State for full name
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

    // Optional: Update user’s first name (demonstrates UPDATE)
    const handleUpdateName = async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error } = await supabase
            .from("user_details")
            .update({ first_name: "UpdatedName" }) // Example update
            .eq("uuid", userData.user.id);

        if (error) {
            Alert.alert("Error", "Failed to update name.");
        } else {
            setFullName("UpdatedName " + fullName.split(" ")[1]);
            Alert.alert("Success", "Name updated!");
        }
    };

    // Optional: Delete user’s account (demonstrates DELETE)
    const handleDeleteAccount = async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { error: deleteError } = await supabase
            .from("user_details")
            .delete()
            .eq("uuid", userData.user.id);

        if (deleteError) {
            Alert.alert("Error", "Failed to delete account.");
            return;
        }

        await supabase.auth.signOut();
        Alert.alert("Success", "Account deleted.");
        router.push("/");
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.welcomeText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {fullName}!</Text>
            <TouchableOpacity style={styles.button} onPress={handleUpdateName}>
                <Text style={styles.buttonText}>Update Name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
            >
                <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4A261",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#6D597A",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
        width: "80%",
    },
    deleteButton: {
        backgroundColor: "#E63946", // Red for delete
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
        width: "80%",
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Welcome;
