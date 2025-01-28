import React from "react";
import { View, Text, Button } from "react-native";
import FruitList from "../components/FruitList";
import ButtonTemplate from "../components/ButtonTemplate";

export default function Index() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Welcome to the Fruit App!
      </Text>
      <FruitList />
      <ButtonTemplate link={"/"} text={"Welcome Page"} color="red"/>
    </View>
  );
}
