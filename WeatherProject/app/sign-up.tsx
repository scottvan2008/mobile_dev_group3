import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { supabase } from "../src/supabase";
import { useRouter } from "expo-router";

const SignUp: React.FC = () => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();

    const handleSignUp = async () => {
        if (firstName.length < 2 || lastName.length < 2) {
            Alert.alert(
                "Invalid Name",
                "First and last names must be at least 2 characters long."
            );
            return;
        }
        if (email.length < 5) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            Alert.alert(
                "Weak Password",
                "Password must be at least 6 characters long."
            );
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert("Sign Up Failed", error.message);
            return;
        }

        const user = data.user;
        if (user) {
            await supabase.from("user_details").insert({
                uuid: user.id,
                first_name: firstName,
                last_name: lastName,
                email,
            });
            Alert.alert(
                "Account Created",
                "Your account has been created successfully! Please sign in.",
                [{ text: "OK", onPress: () => router.push("/") }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Please fill in your information to get started
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputRow}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter first name"
                                placeholderTextColor="#A0AEC0"
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter last name"
                                placeholderTextColor="#A0AEC0"
                                value={lastName}
                                onChangeText={setLastName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#A0AEC0"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor="#A0AEC0"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <Text style={styles.passwordHint}>
                            Password must be at least 6 characters
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignUp}
                    >
                        <Text style={styles.signupButtonText}>
                            Create Account
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push("/")}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#EBF8FF", // Light blue background
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2B6CB0", // Darker blue for title
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#4A5568",
        textAlign: "center",
    },
    form: {
        width: "100%",
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#F7FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: "#2D3748",
    },
    passwordHint: {
        fontSize: 12,
        color: "#718096",
        marginTop: 4,
    },
    signupButton: {
        backgroundColor: "#3182CE", // Primary blue
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    signupButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    loginLinkContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    loginText: {
        color: "#4A5568",
        fontSize: 14,
    },
    loginLink: {
        color: "#3182CE",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
});

export default SignUp;
