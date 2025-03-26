"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    onHide: () => void;
    duration?: number;
}

const getToastConfig = (type: ToastType) => {
    const configs = {
        success: {
            icon: "check-circle",
            backgroundColor: "#4CAF50",
            color: "#FFFFFF",
        },
        error: {
            icon: "alert-circle",
            backgroundColor: "#F44336",
            color: "#FFFFFF",
        },
        warning: {
            icon: "alert",
            backgroundColor: "#FF9800",
            color: "#FFFFFF",
        },
        info: {
            icon: "information",
            backgroundColor: "#2196F3",
            color: "#FFFFFF",
        },
    };

    return configs[type];
};

const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = "info",
    onHide,
    duration = 3000,
}) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    const config = getToastConfig(type);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: config.backgroundColor,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Icon name={config.icon} size={24} color={config.color} />
            <Text style={[styles.message, { color: config.color }]}>
                {message}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        left: (width - 300) / 2,
        width: 300,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    message: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
});

export default Toast;
