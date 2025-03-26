"use client";

import { useState } from "react";
import { supabase } from "../supabase";
import type { LocationData, SearchResult } from "../types/weather";
import { useAlert } from "../context/AlertContext";
import { useToast } from "../context/ToastContext";

export const useLocationManagement = (
    userId: string | null,
    isSignedIn: boolean
) => {
    const [isLocationSaved, setIsLocationSaved] = useState(false);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const { showAlert } = useAlert();
    const { showToast } = useToast();

    const checkIfLocationSaved = async (currentLocation: LocationData) => {
        if (
            !isSignedIn ||
            !currentLocation.latitude ||
            !currentLocation.longitude
        ) {
            setIsLocationSaved(false);
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                setIsLocationSaved(false);
                return;
            }

            const userId = userData.user.id;
            const { data: existingLocations } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", userId);

            const isDuplicate = (existingLocations || []).some(
                (existingLoc: any) =>
                    Math.abs(existingLoc.latitude - currentLocation.latitude) <
                        0.01 &&
                    Math.abs(
                        existingLoc.longitude - currentLocation.longitude
                    ) < 0.01
            );

            setIsLocationSaved(isDuplicate);
        } catch (e) {
            console.error("Error checking if location is saved:", e);
            setIsLocationSaved(false);
        }
    };

    const saveCurrentLocation = async (currentLocation: LocationData) => {
        if (isProcessingAction) return;

        try {
            setIsProcessingAction(true);
            if (!isSignedIn) {
                showAlert({
                    title: "Sign In Required",
                    message: "Please sign in to save locations.",
                    type: "info",
                });
                return;
            }

            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                showAlert({
                    title: "Error",
                    message: "Unable to fetch user data.",
                    type: "error",
                });
                return;
            }

            const currentUserId = userData.user.id;
            const { latitude, longitude } = currentLocation;
            const { data: existingLocations } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", currentUserId);

            const isDuplicate = (existingLocations || []).some(
                (existingLoc: any) =>
                    Math.abs(existingLoc.latitude - latitude) < 0.01 &&
                    Math.abs(existingLoc.longitude - longitude) < 0.01
            );

            if (isDuplicate) {
                showAlert({
                    title: "Duplicate Location",
                    message:
                        "This location is already in your saved locations.",
                    type: "info",
                });
                return;
            }

            const { error } = await supabase
                .from("saved_locations")
                .insert([
                    {
                        user_id: currentUserId,
                        name: currentLocation.name,
                        latitude,
                        longitude,
                    },
                ])
                .select();

            if (error) {
                showAlert({
                    title: "Error",
                    message: "Unable to save your current location.",
                    type: "error",
                });
            } else {
                showToast(
                    "Current location saved to your locations.",
                    "success"
                );
                setIsLocationSaved(true);
            }
        } catch (e) {
            console.error("Error saving current location:", e);
            showAlert({
                title: "Error",
                message: "An unexpected error occurred.",
                type: "error",
            });
        } finally {
            setIsProcessingAction(false);
        }
    };

    const saveLocation = async (loc: SearchResult) => {
        if (!userId || isProcessingAction) return;

        try {
            setIsProcessingAction(true);
            const locName = `${loc.name}, ${loc.country}`;

            const { data: existingLocations } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", userId);

            const isDuplicate = (existingLocations || []).some(
                (existingLoc: any) =>
                    Math.abs(existingLoc.latitude - loc.latitude) < 0.01 &&
                    Math.abs(existingLoc.longitude - loc.longitude) < 0.01
            );

            if (isDuplicate) {
                showAlert({
                    title: "Duplicate Location",
                    message:
                        "This location is already in your saved locations.",
                    type: "info",
                });
                return;
            }

            const { error } = await supabase
                .from("saved_locations")
                .insert([
                    {
                        user_id: userId,
                        name: locName,
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                    },
                ])
                .select();
            if (error) {
                showAlert({
                    title: "Error",
                    message: "Unable to save location.",
                    type: "error",
                });
            } else {
                showToast(`${locName} saved.`, "success");
                return true;
            }
        } catch (e) {
            console.error(e);
            showAlert({
                title: "Error",
                message: "Unexpected error.",
                type: "error",
            });
        } finally {
            setIsProcessingAction(false);
        }
        return false;
    };

    const deleteLocation = async (locId: string) => {
        if (isProcessingAction) return false;

        try {
            setIsProcessingAction(true);
            const { error } = await supabase
                .from("saved_locations")
                .delete()
                .eq("id", locId);
            if (error) {
                showAlert({
                    title: "Error",
                    message: "Unable to delete location.",
                    type: "error",
                });
                return false;
            }
            showToast("Location deleted successfully.", "success");
            return true;
        } catch (e) {
            console.error(e);
            showAlert({
                title: "Error",
                message: "Unexpected error.",
                type: "error",
            });
            return false;
        } finally {
            setIsProcessingAction(false);
        }
    };

    return {
        isLocationSaved,
        isProcessingAction,
        setIsProcessingAction,
        checkIfLocationSaved,
        saveCurrentLocation,
        saveLocation,
        deleteLocation,
    };
};
