import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="welcome" options={{ title: "Welcome" }} />
        </Tabs>
    );
}
