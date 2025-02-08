import React from "react";
import { View, Button, StyleSheet } from "react-native";

interface IncrementProps {
  onIncrement: () => void;
}

export default function IncrementButton({ onIncrement }: IncrementProps) {
  return (
    <View style={styles.buttonContainer}>
      <Button title="Increment" onPress={onIncrement} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
  },
});
