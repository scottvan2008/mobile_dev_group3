import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const ApiCallComponent = () => {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "https://jsonplaceholder.typicode.com/posts/1"
                );
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>API Call Result</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <View style={styles.dataContainer}>
                    <Text style={styles.dataTitle}>{data.title}</Text>
                    <Text style={styles.dataBody}>{data.body}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    error: {
        fontSize: 16,
        color: "red",
    },
    dataContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        width: "100%",
    },
    dataTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    dataBody: {
        fontSize: 16,
    },
});

export default ApiCallComponent;
