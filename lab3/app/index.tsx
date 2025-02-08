import React from "react";
import { View, Text } from "react-native";
import ButtonTemplate from "../components/ButtonTemplate";

export default function Index() {
  return (
    <View style={{ padding: 20, alignItems: "center", justifyContent: "center", flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Welcome to the Counter App!
      </Text>
      <ButtonTemplate link="/lab_3" text="Go to Lab 3" color="blue" />
    </View>
  );
}
