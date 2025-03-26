"use client"

import { useState } from "react"
import { Alert } from "react-native"
import { supabase } from "../supabase"
import type { LocationData, SearchResult } from "../types/weather"

export const useLocationManagement = (userId: string | null, isSignedIn: boolean) => {
  const [isLocationSaved, setIsLocationSaved] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  const checkIfLocationSaved = async (currentLocation: LocationData) => {
    if (!isSignedIn || !currentLocation.latitude || !currentLocation.longitude) {
      setIsLocationSaved(false)
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setIsLocationSaved(false)
        return
      }

      const userId = userData.user.id
      const { data: existingLocations } = await supabase.from("saved_locations").select("*").eq("user_id", userId)

      const isDuplicate = (existingLocations || []).some(
        (existingLoc: any) =>
          Math.abs(existingLoc.latitude - currentLocation.latitude) < 0.01 &&
          Math.abs(existingLoc.longitude - currentLocation.longitude) < 0.01,
      )

      setIsLocationSaved(isDuplicate)
    } catch (e) {
      console.error("Error checking if location is saved:", e)
      setIsLocationSaved(false)
    }
  }

  const saveCurrentLocation = async (currentLocation: LocationData) => {
    if (isProcessingAction) return

    try {
      setIsProcessingAction(true)
      if (!isSignedIn) {
        Alert.alert("Sign In Required", "Please sign in to save locations.")
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        Alert.alert("Error", "Unable to fetch user data.")
        return
      }

      const currentUserId = userData.user.id
      const { latitude, longitude } = currentLocation
      const { data: existingLocations } = await supabase
        .from("saved_locations")
        .select("*")
        .eq("user_id", currentUserId)

      const isDuplicate = (existingLocations || []).some(
        (existingLoc: any) =>
          Math.abs(existingLoc.latitude - latitude) < 0.01 && Math.abs(existingLoc.longitude - longitude) < 0.01,
      )

      if (isDuplicate) {
        Alert.alert("Duplicate Location", "This location is already in your saved locations.")
        return
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
        .select()

      if (error) {
        Alert.alert("Error", "Unable to save your current location.")
      } else {
        Alert.alert("Success", "Current location saved to your locations.")
        setIsLocationSaved(true)
      }
    } catch (e) {
      console.error("Error saving current location:", e)
      Alert.alert("Error", "An unexpected error occurred.")
    } finally {
      setIsProcessingAction(false)
    }
  }

  const saveLocation = async (loc: SearchResult) => {
    if (!userId || isProcessingAction) return

    try {
      setIsProcessingAction(true)
      const locName = `${loc.name}, ${loc.country}`

      const { data: existingLocations } = await supabase.from("saved_locations").select("*").eq("user_id", userId)

      const isDuplicate = (existingLocations || []).some(
        (existingLoc: any) =>
          Math.abs(existingLoc.latitude - loc.latitude) < 0.01 &&
          Math.abs(existingLoc.longitude - loc.longitude) < 0.01,
      )

      if (isDuplicate) {
        Alert.alert("Duplicate Location", "This location is already in your saved locations.")
        return
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
        .select()
      if (error) Alert.alert("Error", "Unable to save location.")
      else {
        Alert.alert("Success", `${locName} saved.`)
        return true
      }
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
    } finally {
      setIsProcessingAction(false)
    }
    return false
  }

  const deleteLocation = async (locId: string) => {
    if (isProcessingAction) return false

    try {
      setIsProcessingAction(true)
      const { error } = await supabase.from("saved_locations").delete().eq("id", locId)
      if (error) {
        Alert.alert("Error", "Unable to delete location.")
        return false
      }
      return true
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
      return false
    } finally {
      setIsProcessingAction(false)
    }
  }

  return {
    isLocationSaved,
    isProcessingAction,
    setIsProcessingAction,
    checkIfLocationSaved,
    saveCurrentLocation,
    saveLocation,
    deleteLocation,
  }
}

