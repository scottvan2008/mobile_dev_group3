import React from "react";
import { View, Text } from "react-native";

const fruits = ["Apple", "Orange", "Mango"];

const FruitList = () => {
  return (
    <View>
      {fruits.map((fruit, index) => (
        <Text key={index} style={{ fontSize: 18, marginVertical: 5 }}>
          {fruit}
        </Text>
      ))}
    </View>
  );
};

export default FruitList;
