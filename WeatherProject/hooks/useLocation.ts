"use client"

import { useState, useEffect } from "react"
import * as Location from "expo-location"
import type { LocationData, SearchResult } from "@/types/weather"

export function useLocation(params: any) {
  const [currentLocation, setCurrentLocation] = useState<LocationData>({
    name: "Loading...",
    latitude: 0,
    longitude: 0,
  })
  const [prevCityData, setPrevCityData] = useState<LocationData | null>(null)
  const [isViewingSavedLocation, setIsViewingSavedLocation] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const hasLocationParams = params.latitude && params.longitude && params.locationName

    if (hasLocationParams && !isViewingSavedLocation) {
      setCurrentLocation({
        name: params.locationName as string,
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
      })
      setIsViewingSavedLocation(true)
    } else if (
      !hasLocationParams &&
      !currentLocation.name.includes("Loading") &&
      !currentLocation.name.includes("Default")
    ) {
      // Skip if we already have a location
    } else if (!hasLocationParams && !isViewingSavedLocation) {
      getLocationAndWeather()
    }
  }, [params])

  const getLocationAndWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setErrorMessage("Location permission denied. Using default location.")
        setCurrentLocation({
          name: "New York (Default)",
          latitude: 40.7128,
          longitude: -74.006,
        })
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      try {
        const revGeo = await Location.reverseGeocodeAsync({ latitude, longitude })
        let locName = "Unknown Location"
        if (revGeo && revGeo.length > 0) {
          const parts = []
          if (revGeo[0]?.city) parts.push(revGeo[0].city)
          if (revGeo[0]?.region && (!revGeo[0]?.city || revGeo[0].region !== revGeo[0].city)) {
            parts.push(revGeo[0].region)
          }
          if (parts.length > 0) {
            locName = parts.join(", ")
          }
        }
        setCurrentLocation({ name: locName, latitude, longitude })
      } catch (geoError) {
        console.error("Error in reverse geocoding:", geoError)
        setCurrentLocation({ name: "Current Location", latitude, longitude })
      }
    } catch (error) {
      console.error("Error getting location:", error)
      setErrorMessage("Failed to get location. Using default location.")
      setCurrentLocation({
        name: "New York (Default)",
        latitude: 40.7128,
        longitude: -74.006,
      })
    }
  }

  const searchLocation = (location: SearchResult) => {
    if (!prevCityData) setPrevCityData(currentLocation)
    const newLoc = {
      name: `${location.name}, ${location.country}`,
      latitude: location.latitude,
      longitude: location.longitude,
    }
    setCurrentLocation(newLoc)
  }

  return {
    currentLocation,
    setCurrentLocation,
    prevCityData,
    setPrevCityData,
    isViewingSavedLocation,
    errorMessage,
    getLocationAndWeather,
    searchLocation,
  }
}

