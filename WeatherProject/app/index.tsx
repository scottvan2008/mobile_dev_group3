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
    Dimensions,
    Animated,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
    FlatList,
    Alert,
    StatusBar,
    BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../src/supabase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

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
    gradient: readonly [string, string, ...string[]];
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
    const params = useLocalSearchParams();
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
    const [prevCityData, setPrevCityData] = useState<LocationData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [useCelsius, setUseCelsius] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [isViewingSavedLocation, setIsViewingSavedLocation] = useState(false);
    const [isLocationSaved, setIsLocationSaved] = useState(false);

    const searchAnimation = useRef(new Animated.Value(0)).current;
    const mapAnimation = useRef(new Animated.Value(0)).current;
    const weatherRequestRef = useRef<NodeJS.Timeout | null>(null);

    const checkIfLocationSaved = async () => {
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

    const fetchUserDetails = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userId)
                .single();
            if (data && !error)
                setUsername(`${data.first_name} ${data.last_name}`);
        } catch (e) {
            console.error("Error fetching user details:", e);
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            if (prevCityData) {
                setCurrentLocation(prevCityData);
                fetchWeatherData(prevCityData.latitude, prevCityData.longitude);
                setPrevCityData(null);
                return true;
            }
            if (router.canGoBack && router.canGoBack()) {
                router.back();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress
        );
        return () => backHandler.remove();
    }, [router, prevCityData]);

    const handleSignOut = async () => {
        if (isProcessingAction) return;

        try {
            setIsProcessingAction(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert("Error", "Failed to sign out.");
                return;
            }
        } catch (error) {
            console.error("Error during sign out:", error);
            Alert.alert(
                "Error",
                "An unexpected error occurred during sign out."
            );
        } finally {
            setIsProcessingAction(false);
            setIsSignedIn(false);
            setUsername("");
        }
    };

    const saveCurrentLocation = async () => {
        if (isProcessingAction) return;

        try {
            setIsProcessingAction(true);
            if (!isSignedIn) {
                Alert.alert(
                    "Sign In Required",
                    "Please sign in to save locations."
                );
                return;
            }

            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                Alert.alert("Error", "Unable to fetch user data.");
                return;
            }

            const userId = userData.user.id;
            const { latitude, longitude } = currentLocation;
            const { data: existingLocations } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", userId);

            const isDuplicate = (existingLocations || []).some(
                (existingLoc: any) =>
                    Math.abs(existingLoc.latitude - latitude) < 0.01 &&
                    Math.abs(existingLoc.longitude - longitude) < 0.01
            );

            if (isDuplicate) {
                Alert.alert(
                    "Duplicate Location",
                    "This location is already in your saved locations."
                );
                return;
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
                .select();

            if (error) {
                Alert.alert("Error", "Unable to save your current location.");
            } else {
                Alert.alert(
                    "Success",
                    "Current location saved to your locations."
                );
                setIsLocationSaved(true);
            }
        } catch (e) {
            console.error("Error saving current location:", e);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsProcessingAction(false);
        }
    };

    const fetchWeatherData = async (lat: number, lon: number) => {
        if (weatherRequestRef.current) {
            clearTimeout(weatherRequestRef.current);
        }

        weatherRequestRef.current = setTimeout(async () => {
            try {
                setLoadingWeather(true);
                setErrorMessage(null);
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m,is_day,precipitation,relative_humidity_2m,apparent_temperature&hourly=temperature_2m,weathercode,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`;
                const response = await fetch(url);
                if (!response.ok)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                if (!data.current || !data.daily || !data.hourly)
                    throw new Error("Invalid weather data received");

                const weatherDataObj = {
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

                setWeatherData(weatherDataObj);
            } catch (error: unknown) {
                console.error("Error fetching weather data:", error);
                setErrorMessage(
                    error instanceof Error
                        ? error.message || "Failed to load weather data"
                        : "An unknown error occurred"
                );
            } finally {
                setLoadingWeather(false);
                weatherRequestRef.current = null;
            }
        }, 300);
    };

    const getLocationAndWeather = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMessage(
                    "Location permission denied. Using default location."
                );
                setCurrentLocation({
                    name: "New York (Default)",
                    latitude: 40.7128,
                    longitude: -74.006,
                });
                return fetchWeatherData(40.7128, -74.006);
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            try {
                const revGeo = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });
                let locName = "Unknown Location";
                if (revGeo && revGeo.length > 0) {
                    const parts = [];
                    if (revGeo[0]?.city) parts.push(revGeo[0].city);
                    if (
                        revGeo[0]?.region &&
                        (!revGeo[0]?.city ||
                            revGeo[0].region !== revGeo[0].city)
                    ) {
                        parts.push(revGeo[0].region);
                    }
                    if (parts.length > 0) {
                        locName = parts.join(", ");
                    }
                }
                setCurrentLocation({ name: locName, latitude, longitude });
            } catch (geoError) {
                console.error("Error in reverse geocoding:", geoError);
                setCurrentLocation({
                    name: "Current Location",
                    latitude,
                    longitude,
                });
            }
            fetchWeatherData(latitude, longitude);
        } catch (error) {
            console.error("Error getting location:", error);
            setErrorMessage("Failed to get location. Using default location.");
            setCurrentLocation({
                name: "New York (Default)",
                latitude: 40.7128,
                longitude: -74.006,
            });
            fetchWeatherData(40.7128, -74.006);
        }
    };

    const searchLocations = async (query: string) => {
        if (query.length < 2) return setSearchResults([]);
        setIsSearching(true);
        try {
            const res = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                    query
                )}&count=5&language=en&format=json`
            );
            if (!res.ok) throw new Error("Search failed");
            const data = await res.json();
            setSearchResults(
                data.results
                    ? data.results.map((r: any) => ({
                          name: r.name,
                          country: r.country,
                          latitude: r.latitude,
                          longitude: r.longitude,
                      }))
                    : []
            );
        } catch (error) {
            console.error("Error searching locations:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const selectLocation = (location: SearchResult) => {
        if (isProcessingAction) return;

        setIsProcessingAction(true);
        if (!prevCityData) setPrevCityData(currentLocation);
        const newLoc = {
            name: `${location.name}, ${location.country}`,
            latitude: location.latitude,
            longitude: location.longitude,
        };
        setCurrentLocation(newLoc);
        fetchWeatherData(location.latitude, location.longitude);
        setSearchQuery("");
        setSearchResults([]);
        toggleSearch();
        setIsProcessingAction(false);
    };

    const toggleSearch = () => {
        if (isProcessingAction) return;
        setIsProcessingAction(true);
        Animated.timing(searchAnimation, {
            toValue: showSearch ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setShowSearch(!showSearch);
            setIsProcessingAction(false);
        });
    };

    const toggleMap = () => {
        if (isProcessingAction) return;
        setIsProcessingAction(true);
        Animated.timing(mapAnimation, {
            toValue: showMap ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setShowMap(!showMap);
            setIsProcessingAction(false);
        });
    };

    const formatTemperature = (c: number) =>
        useCelsius ? `${Math.round(c)}°C` : `${Math.round((c * 9) / 5 + 32)}°F`;
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            timeZone: "UTC",
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    const formatTime = (d: string) =>
        new Date(d).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

    const getWeatherInfo = (code: number, isDay = 1): WeatherInfo => {
        const map: { [key: number]: WeatherInfo } = {
            0: {
                description: "Clear sky",
                icon: isDay ? "weather-sunny" : "weather-night",
                gradient: isDay
                    ? (["#4A90E2", "#48D1CC"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            1: {
                description: "Mainly clear",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
                gradient: isDay
                    ? (["#5C9CE5", "#00BFFF"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            2: {
                description: "Partly cloudy",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
                gradient: isDay
                    ? (["#5C9CE5", "#48D1CC"] as const)
                    : (["#1A237E", "#4FC3F7"] as const),
            },
            3: {
                description: "Overcast",
                icon: "weather-cloudy",
                gradient: isDay
                    ? (["#6E8EAE", "#87CEEB"] as const)
                    : (["#2C3E50", "#34495E"] as const),
            },
            45: {
                description: "Fog",
                icon: "weather-fog",
                gradient: isDay
                    ? (["#B0C4DE", "#D3D3D3"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            48: {
                description: "Depositing rime fog",
                icon: "weather-fog",
                gradient: isDay
                    ? (["#B0C4DE", "#D3D3D3"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            51: {
                description: "Light drizzle",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            53: {
                description: "Moderate drizzle",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            55: {
                description: "Heavy drizzle",
                icon: "weather-pouring",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            56: {
                description: "Light freezing drizzle",
                icon: "weather-snowy-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            57: {
                description: "Heavy freezing drizzle",
                icon: "weather-snowy-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            61: {
                description: "Light rain",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            63: {
                description: "Moderate rain",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            65: {
                description: "Heavy rain",
                icon: "weather-pouring",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            66: {
                description: "Light freezing rain",
                icon: "weather-snowy-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            67: {
                description: "Heavy freezing rain",
                icon: "weather-snowy-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            71: {
                description: "Light snow",
                icon: "weather-snowy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            73: {
                description: "Moderate snow",
                icon: "weather-snowy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            75: {
                description: "Heavy snow",
                icon: "weather-snowy-heavy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            77: {
                description: "Snow grains",
                icon: "weather-snowy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            80: {
                description: "Light rain showers",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            81: {
                description: "Moderate rain showers",
                icon: "weather-rainy",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            82: {
                description: "Heavy rain showers",
                icon: "weather-pouring",
                gradient: isDay
                    ? (["#4682B4", "#87CEEB"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            },
            85: {
                description: "Light snow showers",
                icon: "weather-snowy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            86: {
                description: "Heavy snow showers",
                icon: "weather-snowy-heavy",
                gradient: isDay
                    ? (["#B0C4DE", "#E0FFFF"] as const)
                    : (["#2F4F4F", "#708090"] as const),
            },
            95: {
                description: "Thunderstorm",
                icon: "weather-lightning",
                gradient: isDay
                    ? (["#4A5568", "#718096"] as const)
                    : (["#1A202C", "#2D3748"] as const),
            },
            96: {
                description: "Thunderstorm with light hail",
                icon: "weather-lightning-rainy",
                gradient: isDay
                    ? (["#4A5568", "#718096"] as const)
                    : (["#1A202C", "#2D3748"] as const),
            },
            99: {
                description: "Thunderstorm with heavy hail",
                icon: "weather-hail",
                gradient: isDay
                    ? (["#4A5568", "#718096"] as const)
                    : (["#1A202C", "#2D3748"] as const),
            },
        };
        return (
            map[code] || {
                description: "Unknown",
                icon: "weather-cloudy",
                gradient: isDay
                    ? (["#5C9CE5", "#48D1CC"] as const)
                    : (["#2C3E50", "#4682B4"] as const),
            }
        );
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setIsSignedIn(!!session);
                if (session) fetchUserDetails(session.user.id);
                setInitializing(false);
            } catch (error) {
                console.error("Error checking session:", error);
                setInitializing(false);
            }
        };

        fetchSession();
        const hasLocationParams =
            params.latitude && params.longitude && params.locationName;

        if (hasLocationParams && !isViewingSavedLocation) {
            setCurrentLocation({
                name: params.locationName as string,
                latitude: Number(params.latitude),
                longitude: Number(params.longitude),
            });
            setIsViewingSavedLocation(true);
            fetchWeatherData(Number(params.latitude), Number(params.longitude));
        } else if (
            !hasLocationParams &&
            !currentLocation.name.includes("Loading") &&
            !currentLocation.name.includes("Default")
        ) {
            // Skip if we already have a location
        } else if (!hasLocationParams && !isViewingSavedLocation) {
            getLocationAndWeather();
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_e, session) => {
            setIsSignedIn(!!session);
            session ? fetchUserDetails(session.user.id) : setUsername("");
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchQuery.trim().length >= 2
                ? searchLocations(searchQuery.trim())
                : setSearchResults([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (
            isSignedIn &&
            currentLocation.latitude !== 0 &&
            currentLocation.longitude !== 0
        ) {
            checkIfLocationSaved();
        }
    }, [isSignedIn, currentLocation.latitude, currentLocation.longitude]);

    if (initializing)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4FC3F7" />
                <Text style={styles.loadingText}>Initializing app...</Text>
            </View>
        );

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

    const searchPanelHeight = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    });
    const mapPanelHeight = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get("window").height * 0.7],
    });

    return (
        <>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />
            <SafeAreaView
                style={[
                    styles.safeArea,
                    { backgroundColor: currentWeatherInfo.gradient[0] },
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <LinearGradient
                        colors={[...currentWeatherInfo.gradient]}
                        style={styles.gradientBackground}
                    >
                        <View style={styles.header}>
                            {prevCityData || isViewingSavedLocation ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        router.replace("/");
                                        setPrevCityData(null);
                                    }}
                                    style={styles.iconButton}
                                >
                                    <Icon name="home" size={22} color="white" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={toggleSearch}
                                    style={styles.iconButton}
                                >
                                    <Icon
                                        name="magnify"
                                        size={22}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={toggleMap}
                                style={styles.locationButton}
                            >
                                <Icon
                                    name="map-marker"
                                    size={18}
                                    color="white"
                                />
                                <Text
                                    style={styles.locationText}
                                    numberOfLines={1}
                                >
                                    {currentLocation.name}
                                </Text>
                                <Icon
                                    name="chevron-down"
                                    size={18}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <View style={styles.headerRightButtons}>
                                {isSignedIn && !isLocationSaved && (
                                    <TouchableOpacity
                                        onPress={saveCurrentLocation}
                                        style={styles.addButton}
                                    >
                                        <Icon
                                            name="plus"
                                            size={18}
                                            color="white"
                                        />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setUseCelsius(!useCelsius)}
                                    style={styles.unitButton}
                                >
                                    <Text style={styles.unitText}>
                                        {useCelsius ? "°C" : "°F"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {loadingWeather ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator
                                        size="large"
                                        color="white"
                                    />
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
                            ) : (
                                weatherData && (
                                    <>
                                        <View style={styles.currentWeather}>
                                            <Icon
                                                name={currentWeatherInfo.icon}
                                                size={120}
                                                color="white"
                                                style={styles.weatherIcon}
                                            />
                                            <Text style={styles.temperature}>
                                                {formatTemperature(
                                                    weatherData.current
                                                        .temperature
                                                )}
                                            </Text>
                                            <Text style={styles.feelsLike}>
                                                Feels like{" "}
                                                {formatTemperature(
                                                    weatherData.current
                                                        .apparent_temperature
                                                )}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.weatherDescription
                                                }
                                            >
                                                {currentWeatherInfo.description}
                                            </Text>
                                            <View style={styles.weatherDetails}>
                                                <View style={styles.detailItem}>
                                                    <Icon
                                                        name="water-percent"
                                                        size={22}
                                                        color="white"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {
                                                            weatherData.current
                                                                .humidity
                                                        }
                                                        %
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Humidity
                                                    </Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Icon
                                                        name="weather-windy"
                                                        size={22}
                                                        color="white"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {
                                                            weatherData.current
                                                                .windspeed
                                                        }{" "}
                                                        km/h
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        {" "}
                                                        km/h
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Wind
                                                    </Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Icon
                                                        name="water"
                                                        size={22}
                                                        color="white"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.detailValue
                                                        }
                                                    >
                                                        {
                                                            weatherData.current
                                                                .precipitation
                                                        }{" "}
                                                        mm
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.detailLabel
                                                        }
                                                    >
                                                        Rain
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.sectionContainer}>
                                            <Text style={styles.sectionTitle}>
                                                7-Day Forecast
                                            </Text>
                                            <View style={styles.dailyContainer}>
                                                {weatherData.daily.time.map(
                                                    (day, index) => {
                                                        const dayInfo =
                                                            getWeatherInfo(
                                                                weatherData
                                                                    .daily
                                                                    .weathercode[
                                                                    index
                                                                ]
                                                            );
                                                        const isToday =
                                                            index === 0;
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
                                                                        size={
                                                                            24
                                                                        }
                                                                        color="white"
                                                                    />
                                                                    {weatherData
                                                                        .daily
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
                                        {selectedDay !== null && (
                                            <View
                                                style={
                                                    styles.dayDetailsContainer
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.dayDetailsTitle
                                                    }
                                                >
                                                    {selectedDay === 0
                                                        ? "Today"
                                                        : formatDate(
                                                              weatherData.daily
                                                                  .time[
                                                                  selectedDay
                                                              ]
                                                          )}
                                                </Text>
                                                <View
                                                    style={
                                                        styles.dayDetailsContent
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.dayDetailItem
                                                        }
                                                    >
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
                                                                weatherData
                                                                    .daily
                                                                    .sunrise[
                                                                    selectedDay
                                                                ]
                                                            )}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.dayDetailItem
                                                        }
                                                    >
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
                                                                weatherData
                                                                    .daily
                                                                    .sunset[
                                                                    selectedDay
                                                                ]
                                                            )}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.dayDetailItem
                                                        }
                                                    >
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
                                                                weatherData
                                                                    .daily
                                                                    .precipitation_sum[
                                                                    selectedDay
                                                                ]
                                                            }{" "}
                                                            mm
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.dayDetailItem
                                                        }
                                                    >
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
                                                                weatherData
                                                                    .daily
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
                                        <View style={styles.authContainer}>
                                            {isSignedIn ? (
                                                <>
                                                    <Text
                                                        style={styles.authTitle}
                                                    >
                                                        Welcome, {username}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={
                                                            styles.myLocationsButton
                                                        }
                                                        onPress={() => {
                                                            if (
                                                                isProcessingAction
                                                            )
                                                                return;
                                                            setIsProcessingAction(
                                                                true
                                                            );
                                                            router.push(
                                                                "/locations"
                                                            );
                                                            setTimeout(
                                                                () =>
                                                                    setIsProcessingAction(
                                                                        false
                                                                    ),
                                                                1000
                                                            );
                                                        }}
                                                    >
                                                        <Icon
                                                            name="map-marker-multiple"
                                                            size={18}
                                                            color="white"
                                                            style={
                                                                styles.buttonIcon
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.buttonText
                                                            }
                                                        >
                                                            My Locations
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={
                                                            styles.signOutButton
                                                        }
                                                        onPress={handleSignOut}
                                                    >
                                                        <Icon
                                                            name="logout"
                                                            size={18}
                                                            color="white"
                                                            style={
                                                                styles.buttonIcon
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.buttonText
                                                            }
                                                        >
                                                            Sign Out
                                                        </Text>
                                                    </TouchableOpacity>
                                                </>
                                            ) : (
                                                <>
                                                    <Text
                                                        style={styles.authTitle}
                                                    >
                                                        Sign in to save
                                                        locations
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={
                                                            styles.signInButton
                                                        }
                                                        onPress={() => {
                                                            if (
                                                                isProcessingAction
                                                            )
                                                                return;
                                                            setIsProcessingAction(
                                                                true
                                                            );
                                                            router.push(
                                                                "/sign-in"
                                                            );
                                                            setTimeout(
                                                                () =>
                                                                    setIsProcessingAction(
                                                                        false
                                                                    ),
                                                                1000
                                                            );
                                                        }}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.buttonText
                                                            }
                                                        >
                                                            Sign In
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={
                                                            styles.signUpButton
                                                        }
                                                        onPress={() => {
                                                            if (
                                                                isProcessingAction
                                                            )
                                                                return;
                                                            setIsProcessingAction(
                                                                true
                                                            );
                                                            router.push(
                                                                "/sign-up"
                                                            );
                                                            setTimeout(
                                                                () =>
                                                                    setIsProcessingAction(
                                                                        false
                                                                    ),
                                                                1000
                                                            );
                                                        }}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.buttonText
                                                            }
                                                        >
                                                            Create Account
                                                        </Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
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
                                )
                            )}
                        </ScrollView>
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
                                                    style={
                                                        styles.searchResultName
                                                    }
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
                                                No locations found. Try a
                                                different search term.
                                            </Text>
                                        ) : null
                                    }
                                />
                            )}
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.mapPanel,
                                { height: mapPanelHeight },
                            ]}
                        >
                            <View style={styles.mapHeader}>
                                <Text style={styles.mapTitle}>Weather Map</Text>
                                <TouchableOpacity onPress={toggleMap}>
                                    <Icon name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            {showMap &&
                                currentLocation.latitude !== 0 &&
                                currentLocation.longitude !== 0 && (
                                    <MapView
                                        style={styles.map}
                                        initialRegion={{
                                            latitude: currentLocation.latitude,
                                            longitude:
                                                currentLocation.longitude,
                                            latitudeDelta: 0.0922,
                                            longitudeDelta: 0.0421,
                                        }}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude:
                                                    currentLocation.latitude,
                                                longitude:
                                                    currentLocation.longitude,
                                            }}
                                            title={currentLocation.name}
                                            description={
                                                weatherData?.current
                                                    ? currentWeatherInfo.description
                                                    : "Loading..."
                                            }
                                        >
                                            <View
                                                style={styles.markerContainer}
                                            >
                                                <Icon
                                                    name={
                                                        currentWeatherInfo.icon
                                                    }
                                                    size={24}
                                                    color="#4FC3F7"
                                                />
                                            </View>
                                        </Marker>
                                    </MapView>
                                )}
                        </Animated.View>
                    </LinearGradient>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 18,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 18,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    locationText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        marginHorizontal: 6,
        maxWidth: 180,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    scrollContent: { paddingBottom: 20 },
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
    errorContainer: { padding: 20, alignItems: "center" },
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
    currentWeather: { alignItems: "center", padding: 20 },
    weatherIcon: { marginBottom: 10 },
    temperature: {
        fontSize: 72,
        fontWeight: "bold",
        color: "white",
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    feelsLike: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    weatherDescription: {
        fontSize: 20,
        color: "white",
        marginTop: 8,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    weatherDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 16,
    },
    detailItem: { alignItems: "center" },
    detailValue: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    detailLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        marginTop: 2,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    sectionContainer: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 12,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    dailyContainer: {
        backgroundColor: "rgba(255,255,255,0.2)",
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
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    selectedDayItem: { backgroundColor: "rgba(255,255,255,0.3)" },
    dayName: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        width: 80,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dailyIconContainer: { flexDirection: "row", alignItems: "center" },
    rainChance: {
        color: "#E1F5FE",
        fontSize: 12,
        marginLeft: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    tempRange: { flexDirection: "row", width: 80, justifyContent: "flex-end" },
    maxTemp: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 8,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    minTemp: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 16,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dayDetailsContainer: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        padding: 16,
    },
    dayDetailsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        marginBottom: 12,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dayDetailsContent: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    dayDetailItem: { alignItems: "center", width: "48%", marginBottom: 16 },
    dayDetailLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        marginTop: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dayDetailValue: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 2,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    authContainer: {
        marginTop: 30,
        marginHorizontal: 16,
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    authTitle: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    poweredByContainer: {
        marginTop: 20,
        alignItems: "center",
        paddingBottom: 20,
    },
    poweredByText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    updatedText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 10,
        marginTop: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
    searchTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        margin: 16,
        paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 40, fontSize: 16, color: "#333" },
    clearButton: { padding: 4 },
    searchLoading: { marginTop: 20 },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchResultTextContainer: { marginLeft: 12 },
    searchResultName: { fontSize: 16, color: "#333" },
    searchResultCountry: { fontSize: 14, color: "#666" },
    noResultsText: { textAlign: "center", padding: 20, color: "#666" },
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
    mapTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    map: { flex: 1 },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#4FC3F7",
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
    buttonIcon: { marginRight: 8 },
    unitButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 18,
        padding: 6,
        minWidth: 36,
        alignItems: "center",
    },
    unitText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    headerRightButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    addButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 18,
        padding: 6,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },
});
