import type React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
    useAlert,
    type AlertType,
    type AlertButton,
} from "../../context/AlertContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const getAlertConfig = (type: AlertType = "info") => {
    const configs = {
        success: {
            icon: "check-circle",
            gradient: ["#4CAF50", "#2E7D32"] as const,
            color: "#E8F5E9",
        },
        error: {
            icon: "alert-circle",
            gradient: ["#F44336", "#C62828"] as const,
            color: "#FFEBEE",
        },
        warning: {
            icon: "alert",
            gradient: ["#FF9800", "#EF6C00"] as const,
            color: "#FFF3E0",
        },
        info: {
            icon: "information",
            gradient: ["#4A90E2", "#3182CE"] as const,
            color: "#E3F2FD",
        },
    };

    return configs[type];
};

const CustomAlert: React.FC = () => {
    const { isVisible, currentAlert, hideAlert, animation } = useAlert();

    if (!isVisible || !currentAlert) return null;

    const { title, message, type = "info", buttons = [] } = currentAlert;
    const config = getAlertConfig(type);

    // If no buttons are provided, add a default "OK" button
    const alertButtons: AlertButton[] =
        buttons.length > 0
            ? buttons
            : [{ text: "OK", onPress: hideAlert, style: "default" }];

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 0],
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const handleButtonPress = (button: AlertButton) => {
        // Always hide the alert first
        hideAlert();

        // Then execute the button's onPress handler if it exists
        // Use setTimeout to ensure the alert is hidden before any action is executed
        if (button.onPress) {
            setTimeout(() => {
                button.onPress?.();
            }, 300);
        }
    };

    const renderButton = (button: AlertButton, index: number) => {
        const isDestructive = button.style === "destructive";
        const isCancel = button.style === "cancel";

        const buttonStyle = [
            styles.button,
            isDestructive && styles.destructiveButton,
            isCancel && styles.cancelButton,
            index < alertButtons.length - 1 && styles.buttonMargin,
        ];

        const textStyle = [
            styles.buttonText,
            isDestructive && styles.destructiveText,
            isCancel && styles.cancelText,
        ];

        return (
            <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleButtonPress(button)}
            >
                <Text style={textStyle}>{button.text}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={hideAlert}
        >
            <TouchableWithoutFeedback onPress={hideAlert}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.alertContainer,
                                { transform: [{ translateY }], opacity },
                            ]}
                        >
                            <LinearGradient
                                colors={config.gradient}
                                style={styles.header}
                            >
                                <Icon
                                    name={config.icon}
                                    size={28}
                                    color={config.color}
                                />
                                <Text style={styles.title}>{title}</Text>
                            </LinearGradient>

                            {message && (
                                <View style={styles.messageContainer}>
                                    <Text style={styles.message}>
                                        {message}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.buttonContainer}>
                                {alertButtons.map((button, index) =>
                                    renderButton(button, index)
                                )}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginLeft: 12,
        flex: 1,
    },
    messageContainer: {
        padding: 16,
        paddingTop: 8,
    },
    message: {
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        padding: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
    },
    buttonMargin: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    destructiveButton: {
        backgroundColor: "#FFEBEE",
    },
    destructiveText: {
        color: "#D32F2F",
    },
    cancelButton: {
        backgroundColor: "#E3F2FD",
    },
    cancelText: {
        color: "#1976D2",
    },
});

export default CustomAlert;
