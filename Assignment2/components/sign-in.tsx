import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import credentials from "../credentials.json";
import { useRouter } from "expo-router";  // Use the useRouter hook correctly


// Define the props for the SignIn component
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
    // State to handle password input
    const [password, setPassword] = useState<string>("");

    // Function to validate password characters 
    const isPasswordValid = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumber &&
            hasSpecialChar
        );
    };
    const router = useRouter();
    // Function to handle login logic
    const handleLogin = () => {
        if (username.length < 5) {
            Alert.alert("Error", "Username must be at least 5 characters long.");
            return;
        }

        if (!isPasswordValid(password)) {
            Alert.alert(
                "Error",
                "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        const user = credentials.users.find((user) => user.username === username);

        if (!user) {
            Alert.alert("Error", "Username not found.");
            return;
        }

        if (user.password !== password) {
            Alert.alert("Error", "Incorrect password.");
            return;
        }

        setIsSignedIn(true);
        router.push('/tabs');

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#fff"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#fff"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "#F4A261",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    input: {
        width: "100%",
        backgroundColor: "#e76f51",
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        color: "#fff",
        fontSize: 16,
    },
    button: {
        width: "100%",
        backgroundColor: "#6D597A",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
});

export default SignIn;
