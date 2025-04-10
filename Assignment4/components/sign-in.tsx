import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { supabase } from "../src/supabase";
import { useRouter } from "expo-router";

type SignInProps = {
    setIsSignedIn: (isSignedIn: boolean) => void;
    username: string;
    setUsername: (username: string) => void;
};

const SignIn: React.FC<SignInProps> = ({
    setIsSignedIn,
    username,
    setUsername,
}) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();

    const handleLogin = async () => {
        if (email.length < 5) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Login Failed", error.message);
            return;
        }

        setIsSignedIn(true);
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
                />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push("/sign-up")}
            >
                <Text style={styles.signupButtonText}>Create an Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#EBF8FF", // Light blue background
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2B6CB0", // Darker blue for title
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
        backgroundColor: "#3182CE", // Primary blue
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
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
        backgroundColor: "#EBF8FF", // Light blue background
        borderWidth: 1,
        borderColor: "#3182CE",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    signupButtonText: {
        color: "#3182CE", // Blue text
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SignIn;
