"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/src/supabase"
import type { SavedLocation, WeatherData } from "@/types/locations"
import { Alert } from "react-native"

export function useLocations(userId: string | null) {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const weatherRequestsInProgress = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (userId) {
      fetchSavedLocations(userId)
    }
  }, [userId])

  const fetchSavedLocations = async (uid: string) => {
    try {
      setLoading(true)
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
      setLoading(false)
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

  const fetchWeatherForLocation = async (lat: number, lon: number): Promise<WeatherData | null> => {
    const requestKey = `${lat}-${lon}`
    if (weatherRequestsInProgress.current.has(requestKey)) {
      return null
    }

    weatherRequestsInProgress.current.add(requestKey)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      )
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const data = await res.json()
      return {
        temperature: data.current.temperature_2m,
        weathercode: data.current.weathercode,
        is_day: data.current.is_day,
        temperature_max: data.daily.temperature_2m_max[0],
        temperature_min: data.daily.temperature_2m_min[0],
      }
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

  const deleteLocation = async (locId: string) => {
    try {
      const { error } = await supabase.from("saved_locations").delete().eq("id", locId)
      if (error) Alert.alert("Error", "Unable to delete location.")
      else if (userId) fetchSavedLocations(userId)
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
    }
  }

  const saveLocation = async (name: string, latitude: number, longitude: number) => {
    if (!userId) return false

    try {
      const isDuplicate = savedLocations.some(
        (existingLoc) =>
          Math.abs(existingLoc.latitude - latitude) < 0.01 && Math.abs(existingLoc.longitude - longitude) < 0.01,
      )

      if (isDuplicate) {
        Alert.alert("Duplicate Location", "This location is already in your saved locations.")
        return false
      }

      const { error } = await supabase
        .from("saved_locations")
        .insert([
          {
            user_id: userId,
            name,
            latitude,
            longitude,
          },
        ])
        .select()
      if (error) {
        Alert.alert("Error", "Unable to save location.")
        return false
      }

      fetchSavedLocations(userId)
      return true
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Unexpected error.")
      return false
    }
  }

  return {
    savedLocations,
    loading,
    refreshing,
    handleRefresh,
    deleteLocation,
    saveLocation,
    refetch: () => userId && fetchSavedLocations(userId),
  }
}

