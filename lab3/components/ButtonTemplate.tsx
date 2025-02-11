import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface ButtonTemplateProps {
  link: string;
  text: string;
  color?: string;
}

export default function ButtonTemplate({ link, text, color }: ButtonTemplateProps) {
  const router = useRouter();

  return (
    <View style={styles.buttonContainer}>
      <Button title={text} onPress={() => router.push(link)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 10,
  },
});
