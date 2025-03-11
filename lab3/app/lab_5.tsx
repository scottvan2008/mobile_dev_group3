import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import ApiCallComponent from "../components/apiCall";

export default function Lab5() {
    const [showComponent, setShowComponent] = useState(false);

    return (
        <View style={styles.container}>
            <Button
                title={showComponent ? "Hide API Call" : "Show API Call"}
                onPress={() => setShowComponent(!showComponent)}
            />
            {showComponent && <ApiCallComponent />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
