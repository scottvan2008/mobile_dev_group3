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

    // Function to handle login logic
    const handleLogin = () => {
        if (username.length < 3) {
            Alert.alert("Error", "Username too short");
            return;
        }

        const user = credentials.users.find(
            (user) => user.username === username
        );

        if (!user) {
            Alert.alert("Error", "Username not found");
            return;
        }

        if (user.password !== password) {
            Alert.alert("Error", "Incorrect password");
            return;
        }

        setIsSignedIn(true);
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
