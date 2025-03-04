import React from "react";
import { Text, StyleSheet, View } from "react-native";
import ApiCallComponent from "../components/callAPI";
 
export default function ApiCall() {
  return (
    <View style={styles.container}>
      <ApiCallComponent />
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
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});