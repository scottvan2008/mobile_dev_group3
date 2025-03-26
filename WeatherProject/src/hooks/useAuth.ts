"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAlert } from "../context/AlertContext";

export const useAuth = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [initializing, setInitializing] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const { showAlert } = useAlert();

    const fetchUserDetails = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userId)
                .single();
            if (data && !error) {
                setUsername(`${data.first_name} ${data.last_name}`);
                return `${data.first_name} ${data.last_name}`;
            }
            return "";
        } catch (e) {
            console.error("Error fetching user details:", e);
            return "";
        }
    };

    const handleSignOut = async () => {
        if (isProcessingAction) return;

        try {
            setIsProcessingAction(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                showAlert({
                    title: "Error",
                    message: "Failed to sign out.",
                    type: "error",
                });
                return;
            }
            // Reset auth state
            setIsSignedIn(false);
            setUsername("");
            setUserId(null);
        } catch (error) {
            console.error("Error during sign out:", error);
            showAlert({
                title: "Error",
                message: "An unexpected error occurred during sign out.",
                type: "error",
            });
        } finally {
            setIsProcessingAction(false);
        }
    };

    const checkSession = async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setIsSignedIn(!!session);
            if (session) {
                setUserId(session.user.id);
                await fetchUserDetails(session.user.id);
            }
            setInitializing(false);
        } catch (error) {
            console.error("Error checking session:", error);
            setInitializing(false);
        }
    };

    useEffect(() => {
        checkSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_e, session) => {
            setIsSignedIn(!!session);
            if (session) {
                setUserId(session.user.id);
                fetchUserDetails(session.user.id);
            } else {
                setUsername("");
                setUserId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        isSignedIn,
        username,
        initializing,
        userId,
        isProcessingAction,
        setIsProcessingAction,
        fetchUserDetails,
        handleSignOut,
    };
};
