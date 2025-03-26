"use client";

import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: () => void;
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState<ToastType>("info");
    const [duration, setDuration] = useState(3000);

    const showToast = (
        message: string,
        type: ToastType = "info",
        duration = 3000
    ) => {
        setMessage(message);
        setType(type);
        setDuration(duration);
        setVisible(true);
    };

    const hideToast = () => {
        setVisible(false);
    };

    return (
        <ToastContext.Provider
            value={{ showToast, hideToast, visible, message, type, duration }}
        >
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
