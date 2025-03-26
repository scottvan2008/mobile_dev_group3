"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { supabase } from "../src/supabase"
import { LinearGradient } from "expo-linear-gradient"

// Components
import { WeatherHeader } from "@/app/components/ui/WeatherHeader"
import { WeatherCard } from "@/app/components/weather/WeatherCard"
import { WeatherDetails } from "@/app/components/weather/WeatherDetails"
import { DailyForecast } from "@/app/components/weather/DailyForecast"
import { DayDetails } from "@/app/components/weather/DayDetails"
import { SearchPanel } from "@/app/components/search/SearchPanel"
import { MapPanel } from "@/app/components/map/MapPanel"
import { AuthSection } from "@/app/components/auth/AuthSection"
import { Footer } from "@/app/components/ui/Footer"

// Hooks
import { useWeather } from "@/hooks/useWeather"
import { useAuth } from "@/hooks/useAuth"
import { useLocation } from "@/hooks/useLocation"

// Utils
import { getWeatherInfo } from "@/utils/weather"

export default function Index() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // Custom hooks
  const { isSignedIn, username, isProcessingAction, setIsProcessingAction, handleSignOut } = useAuth()
  const { currentLocation, prevCityData, setPrevCityData, searchLocation, setCurrentLocation } = useLocation(params)
  const { weatherData, loading: loadingWeather, error: errorMessage, refetch } = useWeather(currentLocation)

  // State
  const [useCelsius, setUseCelsius] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [isLocationSaved, setIsLocationSaved] = useState(false)

  // Check if location is saved
  useEffect(() => {
    if (isSignedIn && currentLocation.latitude !== 0 && currentLocation.longitude !== 0) {
      checkIfLocationSaved()
    }
  }, [isSignedIn, currentLocation.latitude, currentLocation.longitude])

  const checkIfLocationSaved = async () => {
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

  const saveCurrentLocation = async () => {
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

      const userId = userData.user.id
      const { latitude, longitude } = currentLocation
      const { data: existingLocations } = await supabase.from("saved_locations").select("*").eq("user_id", userId)

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
            user_id: userId,
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

  // Get current weather info for gradient background
  const currentWeatherInfo = weatherData?.current
    ? getWeatherInfo(weatherData.current.weathercode, weatherData.current.is_day)
    : { description: "Loading...", icon: "weather-cloudy", gradient: ["#87CEEB", "#48D1CC"] as const }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentWeatherInfo.gradient[0] }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
          <LinearGradient colors={[...currentWeatherInfo.gradient]} style={styles.gradientBackground}>
            <WeatherHeader
              location={currentLocation}
              onSearchPress={() => setShowSearch(true)}
              onMapPress={() => setShowMap(true)}
              useCelsius={useCelsius}
              onToggleUnit={() => setUseCelsius(!useCelsius)}
              onAddLocation={saveCurrentLocation}
              isLocationSaved={isLocationSaved}
              showBackButton={!!prevCityData}
              onBackPress={() => {
                if (prevCityData) {
                  setCurrentLocation(prevCityData)
                  setPrevCityData(null)
                }
              }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {loadingWeather ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.loadingText}>Loading weather data...</Text>
                </View>
              ) : errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                weatherData && (
                  <>
                    <WeatherCard
                      temperature={weatherData.current.temperature}
                      weatherInfo={currentWeatherInfo}
                      description={currentWeatherInfo.description}
                      useCelsius={useCelsius}
                      apparentTemperature={weatherData.current.apparent_temperature}
                    />

                    <WeatherDetails currentWeather={weatherData.current} />

                    <DailyForecast
                      dailyWeather={weatherData.daily}
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                      useCelsius={useCelsius}
                    />

                    <DayDetails dailyWeather={weatherData.daily} selectedDay={selectedDay} />

                    <AuthSection
                      isSignedIn={isSignedIn}
                      username={username}
                      onSignOut={handleSignOut}
                      onNavigateToLocations={() => router.push("/locations")}
                      onNavigateToSignIn={() => router.push("/sign-in")}
                      onNavigateToSignUp={() => router.push("/sign-up")}
                    />

                    <Footer />
                  </>
                )
              )}
            </ScrollView>

            <SearchPanel visible={showSearch} onClose={() => setShowSearch(false)} onSelectLocation={searchLocation} />

            <MapPanel
              visible={showMap}
              onClose={() => setShowMap(false)}
              location={currentLocation}
              weatherCode={weatherData?.current.weathercode}
              isDay={weatherData?.current.is_day}
            />
          </LinearGradient>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

