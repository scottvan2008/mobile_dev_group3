import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="locations"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="sign-in"
                options={{
                    title: "Sign In",
                }}
            />
            <Stack.Screen
                name="sign-up"
                options={{
                    title: "Create Account",
                }}
            />
        </Stack>
    );
}
