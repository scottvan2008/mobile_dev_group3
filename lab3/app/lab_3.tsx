import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import IncrementButton from "../components/IncrementBtn";
import DecrementButton from "../components/DecrementBtn";

export default function Lab3() {
  const [counter, setCounter] = useState(0);

  const increment = () => setCounter((prev) => prev + 1);
  const decrement = () => setCounter((prev) => prev - 1);

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Counter: {counter}</Text>
      <IncrementButton onIncrement={increment} />
      <DecrementButton onDecrement={decrement} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
