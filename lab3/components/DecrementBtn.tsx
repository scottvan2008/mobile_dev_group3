import React from "react";
import { View, Button, StyleSheet } from "react-native";

interface DecrementProps {
  onDecrement: () => void;
}

export default function DecrementButton({ onDecrement }: DecrementProps) {
  return (
    <View style={styles.buttonContainer}>
      <Button title="Decrement" onPress={onDecrement} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
  },
});
