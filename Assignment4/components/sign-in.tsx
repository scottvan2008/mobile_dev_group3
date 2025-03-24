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
            Alert.alert("Error", "Email must be at least 5 characters long.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Error", error.message);
            return;
        }

        setIsSignedIn(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#fff"
                value={email}
                onChangeText={setEmail}
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
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/sign-up")}
            >
                <Text style={styles.buttonText}>Go to Sign Up</Text>
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
