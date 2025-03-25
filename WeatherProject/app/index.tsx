"use client";

import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Dimensions,
    Animated,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
    FlatList,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../src/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

// Weather data interfaces
interface CurrentWeather {
    temperature: number;
    weathercode: number;
    windspeed: number;
    winddirection: number;
    time: string;
    is_day: number;
    precipitation: number;
    humidity: number;
    apparent_temperature: number;
}

interface DailyWeather {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
}

interface HourlyWeather {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
}

interface WeatherData {
    current: CurrentWeather;
    daily: DailyWeather;
    hourly: HourlyWeather;
    latitude: number;
    longitude: number;
}

interface WeatherInfo {
    description: string;
    icon: string;
    gradient: readonly string[];
}

interface LocationData {
    name: string;
    latitude: number;
    longitude: number;
}

interface SearchResult {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

export default function Index() {
    const router = useRouter();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [initializing, setInitializing] = useState(true);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<LocationData>({
        name: "Loading...",
        latitude: 0,
        longitude: 0,
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [useCelsius, setUseCelsius] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
    const [selectedDay, setSelectedDay] = useState(0);

    const searchAnimation = useRef(new Animated.Value(0)).current;
    const mapAnimation = useRef(new Animated.Value(0)).current;
    const settingsAnimation = useRef(new Animated.Value(0)).current;

    // Fetch user details from Supabase
    const fetchUserDetails = async (userId: string) => {
        const { data, error } = await supabase
            .from("user_details")
            .select("first_name, last_name")
            .eq("uuid", userId)
            .single();
        if (data && !error) {
            setUsername(`${data.first_name} ${data.last_name}`);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert("Error", "Failed to sign out.");
                return;
            }
            // User state will be updated by the auth state change listener
        } catch (error) {
            console.error("Error during sign out:", error);
            Alert.alert(
                "Error",
                "An unexpected error occurred during sign out."
            );
        }
    };

    // Fetch weather data from Open-Meteo API
    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            setLoadingWeather(true);
            setErrorMessage(null);

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day,precipitation,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weathercode,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Transform API response to match our interface
            const weatherData: WeatherData = {
                current: {
                    temperature: data.current.temperature_2m,
                    weathercode: data.current.weathercode,
                    windspeed: data.current.windspeed_10m,
                    winddirection: data.current.winddirection_10m,
                    time: data.current.time,
                    is_day: data.current.is_day,
                    precipitation: data.current.precipitation,
                    humidity: data.current.relative_humidity_2m,
                    apparent_temperature: data.current.apparent_temperature,
                },
                daily: {
                    time: data.daily.time,
                    weathercode: data.daily.weathercode,
                    temperature_2m_max: data.daily.temperature_2m_max,
                    temperature_2m_min: data.daily.temperature_2m_min,
                    sunrise: data.daily.sunrise,
                    sunset: data.daily.sunset,
                    precipitation_sum: data.daily.precipitation_sum,
                    precipitation_probability_max:
                        data.daily.precipitation_probability_max,
                },
                hourly: {
                    time: data.hourly.time,
                    temperature_2m: data.hourly.temperature_2m,
                    weathercode: data.hourly.weathercode,
                    precipitation_probability:
                        data.hourly.precipitation_probability,
                },
                latitude: data.latitude,
                longitude: data.longitude,
            };

            setWeatherData(weatherData);
        } catch (error: unknown) {
            console.error("Error fetching weather data:", error);
            if (error instanceof Error) {
                setErrorMessage(error.message || "Failed to load weather data");
            } else {
                setErrorMessage("An unknown error occurred");
            }
        } finally {
            setLoadingWeather(false);
        }
    };

    // Get user's location and fetch weather
    const getLocationAndWeather = async () => {
        try {
            // Request foreground location permission
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log(
                    "Location permission denied, using default location"
                );
                setCurrentLocation({
                    name: "New York (Default)",
                    latitude: 40.7128,
                    longitude: -74.006,
                });
                fetchWeatherData(40.7128, -74.006); // Fallback to New York
                return;
            }

            // Get current position
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode to get city name
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            const city = reverseGeocode[0]?.city || "Unknown Location";
            const region = reverseGeocode[0]?.region;
            const country = reverseGeocode[0]?.country;

            let locationName = city;
            if (region && region !== city) {
                locationName += `, ${region}`;
            }

            setCurrentLocation({
                name: locationName,
                latitude,
                longitude,
            });

            // Fetch weather for user's location
            fetchWeatherData(latitude, longitude);
        } catch (error: unknown) {
            console.error("Error getting location:", error);
            setCurrentLocation({
                name: "New York (Default)",
                latitude: 40.7128,
                longitude: -74.006,
            });
            fetchWeatherData(40.7128, -74.006); // Fallback to New York on error
        }
    };

    // Search for locations
    const searchLocations = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                    query
                )}&count=5&language=en&format=json`
            );

            if (!response.ok) {
                throw new Error("Search failed");
            }

            const data = await response.json();

            if (data.results) {
                const results: SearchResult[] = data.results.map(
                    (result: any) => ({
                        name: result.name,
                        country: result.country,
                        latitude: result.latitude,
                        longitude: result.longitude,
                    })
                );
                setSearchResults(results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching locations:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Select a location from search results
    const selectLocation = (location: SearchResult) => {
        setCurrentLocation({
            name: `${location.name}, ${location.country}`,
            latitude: location.latitude,
            longitude: location.longitude,
        });

        fetchWeatherData(location.latitude, location.longitude);
        setSearchQuery("");
        setSearchResults([]);
        toggleSearch();
    };

    // Toggle search panel
    const toggleSearch = () => {
        Animated.timing(searchAnimation, {
            toValue: showSearch ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowSearch(!showSearch);
    };

    // Toggle map view
    const toggleMap = () => {
        Animated.timing(mapAnimation, {
            toValue: showMap ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowMap(!showMap);
    };

    // Toggle settings panel
    const toggleSettings = () => {
        Animated.timing(settingsAnimation, {
            toValue: showSettings ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowSettings(!showSettings);
    };

    // Convert temperature based on user preference
    const formatTemperature = (celsius: number) => {
        if (useCelsius) {
            return `${Math.round(celsius)}°C`;
        } else {
            const fahrenheit = (celsius * 9) / 5 + 32;
            return `${Math.round(fahrenheit)}°F`;
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Weather code to description, icon, and gradient mapping
    const getWeatherInfo = (weatherCode: number, isDay = 1): WeatherInfo => {
        // Light blue theme gradients
        const weatherMap: { [key: number]: WeatherInfo } = {
            0: {
                description: "Clear sky",
                icon: isDay ? "weather-sunny" : "weather-night",
                gradient: isDay
                    ? (["#87CEEB", "#48D1CC"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            1: {
                description: "Mainly clear",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
                gradient: isDay
                    ? (["#87CEEB", "#00BFFF"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            2: {
                description: "Partly cloudy",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
                gradient: isDay
                    ? (["#87CEEB", "#B0E0E6"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            3: {
                description: "Overcast",
                icon: "weather-cloudy",
                gradient: ["#B0E0E6", "#87CEEB"] as const,
            },
            45: {
                description: "Fog",
                icon: "weather-fog",
                gradient: ["#B0E0E6", "#ADD8E6"] as const,
            },
            48: {
                description: "Depositing rime fog",
                icon: "weather-fog",
                gradient: ["#B0E0E6", "#ADD8E6"] as const,
            },
            51: {
                description: "Light drizzle",
                icon: "weather-rainy",
                gradient: ["#4FC3F7", "#29B6F6"] as const,
            },
            53: {
                description: "Moderate drizzle",
                icon: "weather-rainy",
                gradient: ["#4FC3F7", "#29B6F6"] as const,
            },
            55: {
                description: "Heavy drizzle",
                icon: "weather-pouring",
                gradient: ["#29B6F6", "#0288D1"] as const,
            },
            56: {
                description: "Light freezing drizzle",
                icon: "weather-snowy-rainy",
                gradient: ["#B3E5FC", "#81D4FA"] as const,
            },
            57: {
                description: "Heavy freezing drizzle",
                icon: "weather-snowy-rainy",
                gradient: ["#B3E5FC", "#81D4FA"] as const,
            },
            61: {
                description: "Light rain",
                icon: "weather-rainy",
                gradient: ["#4FC3F7", "#29B6F6"] as const,
            },
            63: {
                description: "Moderate rain",
                icon: "weather-rainy",
                gradient: ["#29B6F6", "#0288D1"] as const,
            },
            65: {
                description: "Heavy rain",
                icon: "weather-pouring",
                gradient: ["#29B6F6", "#0288D1"] as const,
            },
            66: {
                description: "Light freezing rain",
                icon: "weather-snowy-rainy",
                gradient: ["#B3E5FC", "#81D4FA"] as const,
            },
            67: {
                description: "Heavy freezing rain",
                icon: "weather-snowy-rainy",
                gradient: ["#B3E5FC", "#81D4FA"] as const,
            },
            71: {
                description: "Light snow",
                icon: "weather-snowy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            73: {
                description: "Moderate snow",
                icon: "weather-snowy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            75: {
                description: "Heavy snow",
                icon: "weather-snowy-heavy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            77: {
                description: "Snow grains",
                icon: "weather-snowy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            80: {
                description: "Light rain showers",
                icon: "weather-rainy",
                gradient: ["#4FC3F7", "#29B6F6"] as const,
            },
            81: {
                description: "Moderate rain showers",
                icon: "weather-rainy",
                gradient: ["#29B6F6", "#0288D1"] as const,
            },
            82: {
                description: "Heavy rain showers",
                icon: "weather-pouring",
                gradient: ["#29B6F6", "#0288D1"] as const,
            },
            85: {
                description: "Light snow showers",
                icon: "weather-snowy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            86: {
                description: "Heavy snow showers",
                icon: "weather-snowy-heavy",
                gradient: ["#E0F7FA", "#B2EBF2"] as const,
            },
            95: {
                description: "Thunderstorm",
                icon: "weather-lightning",
                gradient: ["#4FC3F7", "#0288D1"] as const,
            },
            96: {
                description: "Thunderstorm with light hail",
                icon: "weather-lightning-rainy",
                gradient: ["#4FC3F7", "#0288D1"] as const,
            },
            99: {
                description: "Thunderstorm with heavy hail",
                icon: "weather-hail",
                gradient: ["#4FC3F7", "#0288D1"] as const,
            },
        };

        const defaultInfo = {
            description: "Unknown",
            icon: "weather-cloudy",
            gradient: ["#87CEEB", "#48D1CC"] as const,
        };

        return weatherMap[weatherCode] || defaultInfo;
    };

    // Get current hour's weather
    const getCurrentHourlyWeather = () => {
        if (!weatherData) return [];

        const now = new Date();
        const currentHour = now.getHours();

        // Get the next 24 hours of data starting from current hour
        const hourlyData = [];
        let foundCurrentHour = false;
        let count = 0;

        for (let i = 0; i < weatherData.hourly.time.length && count < 24; i++) {
            const hourTime = new Date(weatherData.hourly.time[i]);

            if (
                !foundCurrentHour &&
                hourTime.getHours() === currentHour &&
                hourTime.getDate() === now.getDate()
            ) {
                foundCurrentHour = true;
            }

            if (foundCurrentHour) {
                hourlyData.push({
                    time: weatherData.hourly.time[i],
                    temperature: weatherData.hourly.temperature_2m[i],
                    weathercode: weatherData.hourly.weathercode[i],
                    precipitation_probability:
                        weatherData.hourly.precipitation_probability[i],
                });
                count++;
            }
        }

        return hourlyData;
    };

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsSignedIn(!!session);
            if (session) {
                fetchUserDetails(session.user.id);
            }
            setInitializing(false);
        });

        // Subscribe to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsSignedIn(!!session);
            if (session) {
                fetchUserDetails(session.user.id);
            } else {
                setUsername("");
            }
        });

        // Get location and fetch weather data on mount
        getLocationAndWeather();

        return () => subscription.unsubscribe();
    }, []);

    // Search for locations when query changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                searchLocations(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    if (initializing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4FC3F7" />
                <Text style={styles.loadingText}>Initializing app...</Text>
            </View>
        );
    }

    // Get weather info for current conditions
    const currentWeatherInfo = weatherData?.current
        ? getWeatherInfo(
              weatherData.current.weathercode,
              weatherData.current.is_day
          )
        : {
              description: "Loading...",
              icon: "weather-cloudy",
              gradient: ["#87CEEB", "#48D1CC"] as const,
          };

    // Calculate search panel position
    const searchPanelHeight = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    });

    // Calculate map panel position
    const mapPanelHeight = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get("window").height * 0.7],
    });

    // Calculate settings panel position
    const settingsPanelHeight = settingsAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 250],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <LinearGradient
                    colors={currentWeatherInfo.gradient as readonly string[]}
                    style={styles.gradientBackground}
                >
                    {/* Header with location and action buttons */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={toggleSearch}
                            style={styles.iconButton}
                        >
                            <Icon name="magnify" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleMap}
                            style={styles.locationButton}
                        >
                            <Icon name="map-marker" size={20} color="white" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {currentLocation.name}
                            </Text>
                            <Icon name="chevron-down" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleSettings}
                            style={styles.iconButton}
                        >
                            <Icon name="cog" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Main content */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {loadingWeather ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="white" />
                                <Text style={styles.loadingText}>
                                    Loading weather data...
                                </Text>
                            </View>
                        ) : errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Icon
                                    name="alert-circle-outline"
                                    size={50}
                                    color="white"
                                />
                                <Text style={styles.errorText}>
                                    {errorMessage}
                                </Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={() =>
                                        fetchWeatherData(
                                            currentLocation.latitude,
                                            currentLocation.longitude
                                        )
                                    }
                                >
                                    <Text style={styles.retryButtonText}>
                                        Retry
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : weatherData ? (
                            <>
                                {/* Current weather */}
                                <View style={styles.currentWeather}>
                                    <Icon
                                        name={currentWeatherInfo.icon}
                                        size={120}
                                        color="white"
                                        style={styles.weatherIcon}
                                    />

                                    <Text style={styles.temperature}>
                                        {formatTemperature(
                                            weatherData.current.temperature
                                        )}
                                    </Text>

                                    <Text style={styles.feelsLike}>
                                        Feels like{" "}
                                        {formatTemperature(
                                            weatherData.current
                                                .apparent_temperature
                                        )}
                                    </Text>

                                    <Text style={styles.weatherDescription}>
                                        {currentWeatherInfo.description}
                                    </Text>

                                    <View style={styles.weatherDetails}>
                                        <View style={styles.detailItem}>
                                            <Icon
                                                name="water-percent"
                                                size={22}
                                                color="white"
                                            />
                                            <Text style={styles.detailValue}>
                                                {weatherData.current.humidity}%
                                            </Text>
                                            <Text style={styles.detailLabel}>
                                                Humidity
                                            </Text>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Icon
                                                name="weather-windy"
                                                size={22}
                                                color="white"
                                            />
                                            <Text style={styles.detailValue}>
                                                {weatherData.current.windspeed}{" "}
                                                km/h
                                            </Text>
                                            <Text style={styles.detailLabel}>
                                                Wind
                                            </Text>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Icon
                                                name="water"
                                                size={22}
                                                color="white"
                                            />
                                            <Text style={styles.detailValue}>
                                                {
                                                    weatherData.current
                                                        .precipitation
                                                }{" "}
                                                mm
                                            </Text>
                                            <Text style={styles.detailLabel}>
                                                Rain
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Hourly forecast */}
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>
                                        24-Hour Forecast
                                    </Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={
                                            styles.hourlyContainer
                                        }
                                    >
                                        {getCurrentHourlyWeather().map(
                                            (hour, index) => {
                                                const hourInfo = getWeatherInfo(
                                                    hour.weathercode
                                                );
                                                const hourTime = new Date(
                                                    hour.time
                                                );
                                                const isNow = index === 0;

                                                return (
                                                    <View
                                                        key={hour.time}
                                                        style={[
                                                            styles.hourlyItem,
                                                            isNow &&
                                                                styles.currentHourItem,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.hourlyTime
                                                            }
                                                        >
                                                            {isNow
                                                                ? "Now"
                                                                : hourTime.getHours() +
                                                                  ":00"}
                                                        </Text>
                                                        <Icon
                                                            name={hourInfo.icon}
                                                            size={24}
                                                            color="white"
                                                        />
                                                        <Text
                                                            style={
                                                                styles.hourlyTemp
                                                            }
                                                        >
                                                            {formatTemperature(
                                                                hour.temperature
                                                            )}
                                                        </Text>
                                                        {hour.precipitation_probability >
                                                            0 && (
                                                            <View
                                                                style={
                                                                    styles.precipContainer
                                                                }
                                                            >
                                                                <Icon
                                                                    name="water"
                                                                    size={12}
                                                                    color="#E1F5FE"
                                                                />
                                                                <Text
                                                                    style={
                                                                        styles.precipText
                                                                    }
                                                                >
                                                                    {
                                                                        hour.precipitation_probability
                                                                    }
                                                                    %
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            }
                                        )}
                                    </ScrollView>
                                </View>

                                {/* 7-day forecast */}
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>
                                        7-Day Forecast
                                    </Text>
                                    <View style={styles.dailyContainer}>
                                        {weatherData.daily.time.map(
                                            (day, index) => {
                                                const dayInfo = getWeatherInfo(
                                                    weatherData.daily
                                                        .weathercode[index]
                                                );
                                                const isToday = index === 0;

                                                return (
                                                    <TouchableOpacity
                                                        key={day}
                                                        style={[
                                                            styles.dailyItem,
                                                            selectedDay ===
                                                                index &&
                                                                styles.selectedDayItem,
                                                        ]}
                                                        onPress={() =>
                                                            setSelectedDay(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.dayName
                                                            }
                                                        >
                                                            {isToday
                                                                ? "Today"
                                                                : formatDate(
                                                                      day
                                                                  ).split(
                                                                      ","
                                                                  )[0]}
                                                        </Text>

                                                        <View
                                                            style={
                                                                styles.dailyIconContainer
                                                            }
                                                        >
                                                            <Icon
                                                                name={
                                                                    dayInfo.icon
                                                                }
                                                                size={24}
                                                                color="white"
                                                            />
                                                            {weatherData.daily
                                                                .precipitation_probability_max[
                                                                index
                                                            ] > 30 && (
                                                                <Text
                                                                    style={
                                                                        styles.rainChance
                                                                    }
                                                                >
                                                                    {
                                                                        weatherData
                                                                            .daily
                                                                            .precipitation_probability_max[
                                                                            index
                                                                        ]
                                                                    }
                                                                    %
                                                                </Text>
                                                            )}
                                                        </View>

                                                        <View
                                                            style={
                                                                styles.tempRange
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.maxTemp
                                                                }
                                                            >
                                                                {formatTemperature(
                                                                    weatherData
                                                                        .daily
                                                                        .temperature_2m_max[
                                                                        index
                                                                    ]
                                                                ).replace(
                                                                    "°C",
                                                                    "°"
                                                                )}
                                                            </Text>
                                                            <Text
                                                                style={
                                                                    styles.minTemp
                                                                }
                                                            >
                                                                {formatTemperature(
                                                                    weatherData
                                                                        .daily
                                                                        .temperature_2m_min[
                                                                        index
                                                                    ]
                                                                ).replace(
                                                                    "°C",
                                                                    "°"
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            }
                                        )}
                                    </View>
                                </View>

                                {/* Selected day details */}
                                {selectedDay !== null && (
                                    <View style={styles.dayDetailsContainer}>
                                        <Text style={styles.dayDetailsTitle}>
                                            {selectedDay === 0
                                                ? "Today"
                                                : formatDate(
                                                      weatherData.daily.time[
                                                          selectedDay
                                                      ]
                                                  )}
                                        </Text>

                                        <View style={styles.dayDetailsContent}>
                                            <View style={styles.dayDetailItem}>
                                                <Icon
                                                    name="weather-sunset-up"
                                                    size={22}
                                                    color="white"
                                                />
                                                <Text
                                                    style={
                                                        styles.dayDetailLabel
                                                    }
                                                >
                                                    Sunrise
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.dayDetailValue
                                                    }
                                                >
                                                    {formatTime(
                                                        weatherData.daily
                                                            .sunrise[
                                                            selectedDay
                                                        ]
                                                    )}
                                                </Text>
                                            </View>

                                            <View style={styles.dayDetailItem}>
                                                <Icon
                                                    name="weather-sunset-down"
                                                    size={22}
                                                    color="white"
                                                />
                                                <Text
                                                    style={
                                                        styles.dayDetailLabel
                                                    }
                                                >
                                                    Sunset
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.dayDetailValue
                                                    }
                                                >
                                                    {formatTime(
                                                        weatherData.daily
                                                            .sunset[selectedDay]
                                                    )}
                                                </Text>
                                            </View>

                                            <View style={styles.dayDetailItem}>
                                                <Icon
                                                    name="water"
                                                    size={22}
                                                    color="white"
                                                />
                                                <Text
                                                    style={
                                                        styles.dayDetailLabel
                                                    }
                                                >
                                                    Precipitation
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.dayDetailValue
                                                    }
                                                >
                                                    {
                                                        weatherData.daily
                                                            .precipitation_sum[
                                                            selectedDay
                                                        ]
                                                    }{" "}
                                                    mm
                                                </Text>
                                            </View>

                                            <View style={styles.dayDetailItem}>
                                                <Icon
                                                    name="umbrella"
                                                    size={22}
                                                    color="white"
                                                />
                                                <Text
                                                    style={
                                                        styles.dayDetailLabel
                                                    }
                                                >
                                                    Chance of Rain
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.dayDetailValue
                                                    }
                                                >
                                                    {
                                                        weatherData.daily
                                                            .precipitation_probability_max[
                                                            selectedDay
                                                        ]
                                                    }
                                                    %
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Authentication section - Changed to conditionally render Sign In or Sign Out */}
                                <View style={styles.authContainer}>
                                    {isSignedIn ? (
                                        // User is signed in - show welcome, my locations, and sign out buttons
                                        <>
                                            <Text style={styles.authTitle}>
                                                Welcome, {username}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.myLocationsButton}
                                                onPress={() =>
                                                    router.push("/tabs/welcome")
                                                }
                                            >
                                                <Icon
                                                    name="map-marker-multiple"
                                                    size={18}
                                                    color="white"
                                                    style={styles.buttonIcon}
                                                />
                                                <Text style={styles.buttonText}>
                                                    My Locations
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.signOutButton}
                                                onPress={handleSignOut}
                                            >
                                                <Icon
                                                    name="logout"
                                                    size={18}
                                                    color="white"
                                                    style={styles.buttonIcon}
                                                />
                                                <Text style={styles.buttonText}>
                                                    Sign Out
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        // User is not signed in - show sign in and create account buttons
                                        <>
                                            <Text style={styles.authTitle}>
                                                Sign in to save locations and
                                                customize settings
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.signInButton}
                                                onPress={() =>
                                                    router.push("/sign-in")
                                                }
                                            >
                                                <Text style={styles.buttonText}>
                                                    Sign In
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.signUpButton}
                                                onPress={() =>
                                                    router.push("/sign-up")
                                                }
                                            >
                                                <Text style={styles.buttonText}>
                                                    Create Account
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>

                                {/* Powered by section */}
                                <View style={styles.poweredByContainer}>
                                    <Text style={styles.poweredByText}>
                                        Powered by Open-Meteo API
                                    </Text>
                                    <Text style={styles.updatedText}>
                                        Last updated:{" "}
                                        {new Date().toLocaleTimeString()}
                                    </Text>
                                </View>
                            </>
                        ) : null}
                    </ScrollView>

                    {/* Search panel */}
                    <Animated.View
                        style={[
                            styles.searchPanel,
                            { height: searchPanelHeight },
                        ]}
                    >
                        <View style={styles.searchHeader}>
                            <Text style={styles.searchTitle}>
                                Search Location
                            </Text>
                            <TouchableOpacity onPress={toggleSearch}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchInputContainer}>
                            <Icon
                                name="magnify"
                                size={20}
                                color="#666"
                                style={styles.searchIcon}
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for a city..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="words"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery("")}
                                    style={styles.clearButton}
                                >
                                    <Icon
                                        name="close-circle"
                                        size={16}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        {isSearching ? (
                            <ActivityIndicator
                                style={styles.searchLoading}
                                color="#4FC3F7"
                            />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) =>
                                    `${item.name}-${item.latitude}-${item.longitude}`
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.searchResultItem}
                                        onPress={() => selectLocation(item)}
                                    >
                                        <Icon
                                            name="map-marker"
                                            size={20}
                                            color="#4FC3F7"
                                        />
                                        <View
                                            style={
                                                styles.searchResultTextContainer
                                            }
                                        >
                                            <Text
                                                style={styles.searchResultName}
                                            >
                                                {item.name}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.searchResultCountry
                                                }
                                            >
                                                {item.country}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    searchQuery.length > 0 ? (
                                        <Text style={styles.noResultsText}>
                                            No locations found. Try a different
                                            search term.
                                        </Text>
                                    ) : null
                                }
                            />
                        )}
                    </Animated.View>

                    {/* Map panel */}
                    <Animated.View
                        style={[styles.mapPanel, { height: mapPanelHeight }]}
                    >
                        <View style={styles.mapHeader}>
                            <Text style={styles.mapTitle}>Weather Map</Text>
                            <TouchableOpacity onPress={toggleMap}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {showMap && (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: currentLocation.latitude,
                                    longitude: currentLocation.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: currentLocation.latitude,
                                        longitude: currentLocation.longitude,
                                    }}
                                    title={currentLocation.name}
                                    description={
                                        weatherData?.current
                                            ? currentWeatherInfo.description
                                            : "Loading..."
                                    }
                                >
                                    <View style={styles.markerContainer}>
                                        <Icon
                                            name={currentWeatherInfo.icon}
                                            size={24}
                                            color="#4FC3F7"
                                        />
                                    </View>
                                </Marker>
                            </MapView>
                        )}
                    </Animated.View>

                    {/* Settings panel */}
                    <Animated.View
                        style={[
                            styles.settingsPanel,
                            { height: settingsPanelHeight },
                        ]}
                    >
                        <View style={styles.settingsHeader}>
                            <Text style={styles.settingsTitle}>Settings</Text>
                            <TouchableOpacity onPress={toggleSettings}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsContent}>
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>
                                    Temperature Units
                                </Text>
                                <View style={styles.unitToggle}>
                                    <Text
                                        style={[
                                            styles.unitText,
                                            useCelsius && styles.activeUnitText,
                                        ]}
                                    >
                                        Celsius
                                    </Text>
                                    <Switch
                                        value={!useCelsius}
                                        onValueChange={(value) =>
                                            setUseCelsius(!value)
                                        }
                                        trackColor={{
                                            false: "#4FC3F7",
                                            true: "#4FC3F7",
                                        }}
                                        thumbColor={"#fff"}
                                    />
                                    <Text
                                        style={[
                                            styles.unitText,
                                            !useCelsius &&
                                                styles.activeUnitText,
                                        ]}
                                    >
                                        Fahrenheit
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={() => {
                                    fetchWeatherData(
                                        currentLocation.latitude,
                                        currentLocation.longitude
                                    );
                                    toggleSettings();
                                }}
                            >
                                <Icon name="refresh" size={20} color="white" />
                                <Text style={styles.refreshButtonText}>
                                    Refresh Weather Data
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.currentLocationButton}
                                onPress={() => {
                                    getLocationAndWeather();
                                    toggleSettings();
                                }}
                            >
                                <Icon
                                    name="crosshairs-gps"
                                    size={20}
                                    color="white"
                                />
                                <Text style={styles.locationButtonText}>
                                    Use Current Location
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    gradientBackground: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    iconButton: {
        padding: 8,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    locationText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginHorizontal: 8,
        maxWidth: 200,
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
    },
    retryButton: {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
    },
    retryButtonText: {
        color: "white",
        fontWeight: "600",
    },
    currentWeather: {
        alignItems: "center",
        padding: 20,
    },
    weatherIcon: {
        marginBottom: 10,
    },
    temperature: {
        fontSize: 72,
        fontWeight: "bold",
        color: "white",
    },
    feelsLike: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 4,
    },
    weatherDescription: {
        fontSize: 20,
        color: "white",
        marginTop: 8,
    },
    weatherDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        padding: 16,
    },
    detailItem: {
        alignItems: "center",
    },
    detailValue: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    detailLabel: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 12,
        marginTop: 2,
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 12,
    },
    hourlyContainer: {
        paddingBottom: 8,
    },
    hourlyItem: {
        alignItems: "center",
        marginRight: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        padding: 12,
        minWidth: 70,
    },
    currentHourItem: {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    hourlyTime: {
        color: "white",
        fontSize: 14,
        marginBottom: 8,
    },
    hourlyTemp: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
    },
    precipContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    precipText: {
        color: "#E1F5FE",
        fontSize: 12,
        marginLeft: 2,
    },
    dailyContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        overflow: "hidden",
    },
    dailyItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    selectedDayItem: {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    dayName: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        width: 80,
    },
    dailyIconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rainChance: {
        color: "#E1F5FE",
        fontSize: 12,
        marginLeft: 4,
    },
    tempRange: {
        flexDirection: "row",
        width: 80,
        justifyContent: "flex-end",
    },
    maxTemp: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 8,
    },
    minTemp: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 16,
    },
    dayDetailsContainer: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        padding: 16,
    },
    dayDetailsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        marginBottom: 12,
    },
    dayDetailsContent: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    dayDetailItem: {
        alignItems: "center",
        width: "48%",
        marginBottom: 16,
    },
    dayDetailLabel: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 12,
        marginTop: 4,
    },
    dayDetailValue: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 2,
    },
    authContainer: {
        marginTop: 30,
        marginHorizontal: 16,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    authTitle: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
    },
    signInButton: {
        backgroundColor: "#4FC3F7",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
        marginBottom: 12,
    },
    signUpButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
    },
    signOutButton: {
        backgroundColor: "#E53E3E", // Red color for sign out
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    poweredByContainer: {
        marginTop: 20,
        alignItems: "center",
        paddingBottom: 20,
    },
    poweredByText: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 12,
    },
    updatedText: {
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 10,
        marginTop: 4,
    },
    searchPanel: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
        zIndex: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    searchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        margin: 16,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    clearButton: {
        padding: 4,
    },
    searchLoading: {
        marginTop: 20,
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchResultTextContainer: {
        marginLeft: 12,
    },
    searchResultName: {
        fontSize: 16,
        color: "#333",
    },
    searchResultCountry: {
        fontSize: 14,
        color: "#666",
    },
    noResultsText: {
        textAlign: "center",
        padding: 20,
        color: "#666",
    },
    mapPanel: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
        zIndex: 9,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    mapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#4FC3F7",
    },
    settingsPanel: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        overflow: "hidden",
        zIndex: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    settingsContent: {
        padding: 16,
    },
    settingItem: {
        marginBottom: 20,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    unitToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    unitText: {
        fontSize: 14,
        color: "#666",
        marginHorizontal: 8,
    },
    activeUnitText: {
        color: "#4FC3F7",
        fontWeight: "bold",
    },
    refreshButton: {
        backgroundColor: "#4FC3F7",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    refreshButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    currentLocationButton: {
        backgroundColor: "#81D4FA",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    locationButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    myLocationsButton: {
        backgroundColor: "#4FC3F7",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonIcon: {
        marginRight: 8,
    },
});
