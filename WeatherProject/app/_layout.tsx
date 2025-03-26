"use client";

import { Stack } from "expo-router";
import { AlertProvider } from "../src/context/AlertContext";
import { ToastProvider } from "../src/context/ToastContext";
import CustomAlert from "../src/components/ui/CustomAlert";
import Toast from "../src/components/ui/Toast";
import { useToast } from "../src/context/ToastContext";

function ToastWrapper() {
    const { visible, message, type, duration, hideToast } = useToast();

    return (
        <Toast
            visible={visible}
            message={message}
            type={type}
            duration={duration}
            onHide={hideToast}
        />
    );
}

export default function Layout() {
    return (
        <AlertProvider>
            <ToastProvider>
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
                <CustomAlert />
                <ToastWrapper />
            </ToastProvider>
        </AlertProvider>
    );
}
