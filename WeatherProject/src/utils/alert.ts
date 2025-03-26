import { Alert as RNAlert } from "react-native";
import type { AlertOptions } from "../context/AlertContext";

// This is a fallback for when the context is not available
export const showNativeAlert = (
    title: string,
    message?: string,
    buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: "default" | "cancel" | "destructive";
    }>
) => {
    RNAlert.alert(
        title,
        message,
        buttons?.map((button) => ({
            text: button.text,
            onPress: button.onPress,
            style: button.style,
        }))
    );
};

// This function will be used to determine whether to use the custom alert or fallback to native
export const showAlert = (
    useCustomAlert: boolean,
    customAlertFn: (options: AlertOptions) => void,
    options: AlertOptions
) => {
    if (useCustomAlert) {
        customAlertFn(options);
    } else {
        showNativeAlert(options.title, options.message, options.buttons);
    }
};
