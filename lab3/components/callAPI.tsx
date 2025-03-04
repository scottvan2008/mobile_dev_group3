import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const ApiCallComponent = () => {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<null | Error>(null);
    const [showData, setShowData] = useState<boolean>(false);

    useEffect(() => {
        makeApiCall();
    }, []);

    const makeApiCall = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://jsonplaceholder.typicode.com/posts/1`,
                {
                    method: "GET",
                    
                }
                
            );
            const result = await response.json();
            setData(result);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to API Call</Text>

            {loading && <Text style={{ fontSize: 20 }}>Loading...</Text>}

            {error && <Text style={{ color: "red" }}>{error.message}</Text>}

            <Button 
                title={showData ? "Hide Data" : "Show Data"} 
                onPress={() => setShowData(!showData)} 
            />

            {showData && data && (
                <View style={styles.dataContainer}>
                    <Text>User ID: {data.userId}</Text>
                    <Text>ID: {data.id}</Text>
                    <Text>Title: {data.title}</Text>
                    <Text>Body: {data.body}</Text>
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
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
    },
    dataContainer: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 5,
        backgroundColor: "#f9f9f9",
    },
});

export default ApiCallComponent;
