"use client";

import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Animated } from "react-native";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
}

export interface AlertOptions {
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    autoClose?: boolean;
    duration?: number;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
    isVisible: boolean;
    currentAlert: AlertOptions | null;
    animation: Animated.Value;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentAlert, setCurrentAlert] = useState<AlertOptions | null>(null);
    const animation = useState(new Animated.Value(0))[0];

    const showAlert = (options: AlertOptions) => {
        const { autoClose = false, duration = 3000 } = options;

        setCurrentAlert(options);
        setIsVisible(true);

        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        if (autoClose) {
            setTimeout(() => {
                hideAlert();
            }, duration);
        }
    };

    const hideAlert = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsVisible(false);
            setCurrentAlert(null);
        });
    };

    return (
        <AlertContext.Provider
            value={{ showAlert, hideAlert, isVisible, currentAlert, animation }}
        >
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
};
