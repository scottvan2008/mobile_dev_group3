"use client"

import { useState, useRef } from "react"
import { Alert } from "react-native"
import { supabase } from "../supabase"
import type { SavedLocation } from "../types/weather"
import { fetchLocationWeather } from "../services/weatherService"

export const useSavedLocations = (userId: string | null) => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const weatherRequestsInProgress = useRef<Set<string>>(new Set())

  const fetchSavedLocations = async (uid: string) => {
    try {
      setLoadingLocations(true)
      const { data, error } = await supabase
        .from("saved_locations")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
      if (error) Alert.alert("Error", "Unable to fetch your saved locations.")
      else {
        const locs = (data || []).map((loc: any) => ({
          ...loc,
          isLoadingWeather: true,
        }))
        setSavedLocations(locs)
        if (locs.length) fetchWeatherForLocations(locs)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingLocations(false)
      setRefreshing(false)
    }
  }

  const fetchWeatherForLocations = async (locs: SavedLocation[]) => {
    const updated = [...locs]
    const batchSize = 2 // Reduce batch size

    for (let i = 0; i < updated.length; i += batchSize) {
      const batch = updated.slice(i, i + batchSize)
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const promises = batch.map(async (loc) => {
        try {
          const weather = await fetchWeatherForLocation(loc.latitude, loc.longitude)
          const idx = updated.findIndex((l) => l.id === loc.id)
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              weather: weather ?? undefined,
              isLoadingWeather: false,
            }
          }
        } catch (err) {
          console.error(err)
          const idx = updated.findIndex((l) => l.id === loc.id)
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              isLoadingWeather: false,
            }
          }
        }
      })

      await Promise.all(promises)
      setSavedLocations([...updated])
    }
  }

  const fetchWeatherForLocation = async (lat: number, lon: number) => {
    const requestKey = `${lat}-${lon}`
    if (weatherRequestsInProgress.current.has(requestKey)) {
      return null
    }

    weatherRequestsInProgress.current.add(requestKey)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const data = await fetchLocationWeather(lat, lon)
      return data
    } catch (e) {
      console.error(e)
      return null
    } finally {
      weatherRequestsInProgress.current.delete(requestKey)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    userId ? fetchSavedLocations(userId) : setRefreshing(false)
  }

  return {
    savedLocations,
    loadingLocations,
    refreshing,
    fetchSavedLocations,
    handleRefresh,
  }
}

