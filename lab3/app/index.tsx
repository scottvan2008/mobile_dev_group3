import React from "react";
import { View, Text } from "react-native";
import ButtonTemplate from "../components/ButtonTemplate";

export default function Index() {
    return (
        <View
            style={{
                padding: 20,
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
            }}
        >
            <Text
                style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}
            >
                Welcome to the Counter App!
            </Text>
            <ButtonTemplate link="/lab_3" text="Go to Lab 3" color="blue" />
            <ButtonTemplate link="/lab_4" text="Go to Lab 4" color="purple" />
            <ButtonTemplate link="/lab_5" text="Go to Lab 5" color="purple" />
            <ButtonTemplate link="/lab_6" text="Go to Lab 6" color="purple" />
        </View>
    );
}
