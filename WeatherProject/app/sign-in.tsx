"use client";

import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { supabase } from "../src/supabase";
import { useRouter } from "expo-router";
import { useAlert } from "../src/context/AlertContext";

export default function SignInPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showAlert } = useAlert();

    const fetchUserDetails = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userId)
                .single();
            if (data && !error) {
                return `${data.first_name} ${data.last_name}`;
            }
            return "";
        } catch (e) {
            console.error("Error fetching user details:", e);
            return "";
        }
    };

    const handleLogin = async () => {
        if (isLoading) return;

        if (email.length < 5) {
            showAlert({
                title: "Invalid Email",
                message: "Please enter a valid email address.",
                type: "warning",
            });
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                showAlert({
                    title: "Login Failed",
                    message: error.message,
                    type: "error",
                });
                return;
            }

            const userId = data.user.id;
            const username = await fetchUserDetails(userId);
            if (username) {
                router.replace("/locations");
            } else {
                showAlert({
                    title: "Error",
                    message: "Failed to fetch user details. Please try again.",
                    type: "error",
                });
            }
        } catch (e) {
            console.error("Error during login:", e);
            showAlert({
                title: "Error",
                message: "An unexpected error occurred. Please try again.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

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
                    editable={!isLoading}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />
            </View>

            <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push("/sign-up")}
                disabled={isLoading}
            >
                <Text style={styles.signupButtonText}>Create an Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#EBF8FF",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2B6CB0",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#4A5568",
        marginBottom: 24,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
        marginBottom: 6,
        alignSelf: "flex-start",
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
    loginButton: {
        width: "100%",
        backgroundColor: "#3182CE",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: "#90CDF4",
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },
    dividerText: {
        paddingHorizontal: 10,
        color: "#718096",
        fontSize: 14,
    },
    signupButton: {
        width: "100%",
        backgroundColor: "#EBF8FF",
        borderWidth: 1,
        borderColor: "#3182CE",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    signupButtonText: {
        color: "#3182CE",
        fontSize: 16,
        fontWeight: "600",
    },
});
