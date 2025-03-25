import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Animated,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
} from "react-native";
import { supabase } from "../../src/supabase";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";

// Interface for weather data
interface WeatherData {
    temperature: number;
    weathercode: number;
    is_day: number;
}

// Interface for saved location with weather
interface SavedLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    weather?: WeatherData;
    isLoadingWeather?: boolean;
}

// Interface for search result
interface SearchResult {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

// Interface for weather info
interface WeatherInfo {
    description: string;
    icon: string;
}

const Welcome: React.FC = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
    const [showAddLocation, setShowAddLocation] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] =
        useState<SavedLocation | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const mapAnimation = useRef(new Animated.Value(0)).current;
    const addLocationAnimation = useRef(new Animated.Value(0)).current;

    // Fetch user details and saved locations on mount
    useEffect(() => {
        fetchUserDetails();
    }, []);

    // Fetch user details from Supabase
    const fetchUserDetails = async () => {
        try {
            setLoading(true);

            const { data: userData, error: userError } =
                await supabase.auth.getUser();

            if (userError || !userData.user) {
                Alert.alert("Error", "Unable to fetch user data.");
                router.push("/");
                return;
            }

            setUserId(userData.user.id);

            // Fetch user profile details
            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userData.user.id)
                .single();

            if (error || !data) {
                Alert.alert("Error", "Unable to fetch user details.");
            } else {
                setFullName(`${data.first_name} ${data.last_name}`);
            }

            // Fetch saved locations
            await fetchSavedLocations(userData.user.id);
        } catch (error) {
            console.error("Error fetching user details:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch saved locations from Supabase
    const fetchSavedLocations = async (userId: string) => {
        try {
            setLoadingLocations(true);

            const { data, error } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching saved locations:", error);
                Alert.alert("Error", "Unable to fetch your saved locations.");
            } else {
                // Add isLoadingWeather flag to each location
                const locationsWithWeatherStatus = (data || []).map(
                    (location) => ({
                        ...location,
                        isLoadingWeather: true,
                    })
                );

                setSavedLocations(locationsWithWeatherStatus);

                // Fetch weather for all locations
                if (locationsWithWeatherStatus.length > 0) {
                    fetchWeatherForLocations(locationsWithWeatherStatus);
                }
            }
        } catch (error) {
            console.error("Error in fetchSavedLocations:", error);
        } finally {
            setLoadingLocations(false);
            setRefreshing(false);
        }
    };

    // Fetch weather data for all locations
    const fetchWeatherForLocations = async (locations: SavedLocation[]) => {
        const updatedLocations = [...locations];

        // Process locations in batches to avoid too many simultaneous requests
        const batchSize = 3;
        for (let i = 0; i < updatedLocations.length; i += batchSize) {
            const batch = updatedLocations.slice(i, i + batchSize);

            // Create an array of promises for the current batch
            const promises = batch.map((location) =>
                fetchWeatherForLocation(location.latitude, location.longitude)
                    .then((weatherData) => {
                        if (weatherData) {
                            const locationIndex = updatedLocations.findIndex(
                                (loc) => loc.id === location.id
                            );
                            if (locationIndex !== -1) {
                                updatedLocations[locationIndex] = {
                                    ...updatedLocations[locationIndex],
                                    weather: weatherData,
                                    isLoadingWeather: false,
                                };
                            }
                        }
                    })
                    .catch((error) => {
                        console.error(
                            `Error fetching weather for ${location.name}:`,
                            error
                        );
                        const locationIndex = updatedLocations.findIndex(
                            (loc) => loc.id === location.id
                        );
                        if (locationIndex !== -1) {
                            updatedLocations[locationIndex] = {
                                ...updatedLocations[locationIndex],
                                isLoadingWeather: false,
                            };
                        }
                    })
            );

            // Wait for all promises in the current batch to resolve
            await Promise.all(promises);

            // Update state after each batch
            setSavedLocations([...updatedLocations]);
        }
    };

    // Fetch weather for a single location
    const fetchWeatherForLocation = async (
        latitude: number,
        longitude: number
    ): Promise<WeatherData | null> => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,is_day&timezone=auto`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            return {
                temperature: data.current.temperature_2m,
                weathercode: data.current.weathercode,
                is_day: data.current.is_day,
            };
        } catch (error) {
            console.error("Error fetching weather data:", error);
            return null;
        }
    };

    // Refresh saved locations and weather
    const handleRefresh = () => {
        setRefreshing(true);
        if (userId) {
            fetchSavedLocations(userId);
        } else {
            setRefreshing(false);
        }
    };

    // Logout handler
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert("Error", "Failed to sign out.");
                return;
            }
            router.push("/");
        } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "An unexpected error occurred during logout.");
        }
    };

    // Toggle add location panel
    const toggleAddLocation = () => {
        setSearchQuery("");
        setSearchResults([]);

        Animated.timing(addLocationAnimation, {
            toValue: showAddLocation ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowAddLocation(!showAddLocation);
    };

    // Toggle map view
    const toggleMap = (location?: SavedLocation) => {
        if (location) {
            setSelectedLocation(location);
        } else {
            setSelectedLocation(null);
        }

        Animated.timing(mapAnimation, {
            toValue: showMap ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowMap(!showMap);
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

    // Save a location to Supabase
    const saveLocation = async (location: SearchResult) => {
        if (!userId) return;

        try {
            const locationName = `${location.name}, ${location.country}`;

            const { data, error } = await supabase
                .from("saved_locations")
                .insert([
                    {
                        user_id: userId,
                        name: locationName,
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                ])
                .select();

            if (error) {
                console.error("Error saving location:", error);
                Alert.alert(
                    "Error",
                    "Unable to save location. Please try again."
                );
            } else {
                Alert.alert(
                    "Success",
                    `${locationName} has been saved to your locations.`
                );
                fetchSavedLocations(userId);
                toggleAddLocation();
            }
        } catch (error) {
            console.error("Error in saveLocation:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    // Delete a saved location
    const deleteLocation = async (locationId: string) => {
        try {
            const { error } = await supabase
                .from("saved_locations")
                .delete()
                .eq("id", locationId);

            if (error) {
                console.error("Error deleting location:", error);
                Alert.alert(
                    "Error",
                    "Unable to delete location. Please try again."
                );
            } else {
                if (userId) {
                    fetchSavedLocations(userId);
                }
            }
        } catch (error) {
            console.error("Error in deleteLocation:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    // View weather for a location
    const viewWeather = (location: SavedLocation) => {
        router.push({
            pathname: "/",
            params: {
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                locationName: location.name,
            },
        });
    };

    // Get current location
    const getCurrentLocation = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission is required to use this feature."
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode to get location name
            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (reverseGeocode.length > 0 && userId) {
                const address = reverseGeocode[0];
                const locationName = [
                    address.city,
                    address.region,
                    address.country,
                ]
                    .filter(Boolean)
                    .join(", ");

                const { data, error } = await supabase
                    .from("saved_locations")
                    .insert([
                        {
                            user_id: userId,
                            name: locationName || "Current Location",
                            latitude,
                            longitude,
                        },
                    ])
                    .select();

                if (error) {
                    console.error("Error saving current location:", error);
                    Alert.alert(
                        "Error",
                        "Unable to save your current location."
                    );
                } else {
                    Alert.alert(
                        "Success",
                        "Your current location has been saved."
                    );
                    fetchSavedLocations(userId);
                }
            }
        } catch (error) {
            console.error("Error getting current location:", error);
            Alert.alert("Error", "Unable to get your current location.");
        }
    };

    // Get weather info based on weather code
    const getWeatherInfo = (
        weatherCode: number,
        isDay: number = 1
    ): WeatherInfo => {
        const weatherMap: { [key: number]: WeatherInfo } = {
            0: {
                description: "Clear sky",
                icon: isDay ? "weather-sunny" : "weather-night",
            },
            1: {
                description: "Mainly clear",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
            },
            2: {
                description: "Partly cloudy",
                icon: isDay
                    ? "weather-partly-cloudy"
                    : "weather-night-partly-cloudy",
            },
            3: {
                description: "Overcast",
                icon: "weather-cloudy",
            },
            45: {
                description: "Fog",
                icon: "weather-fog",
            },
            48: {
                description: "Depositing rime fog",
                icon: "weather-fog",
            },
            51: {
                description: "Light drizzle",
                icon: "weather-rainy",
            },
            53: {
                description: "Moderate drizzle",
                icon: "weather-rainy",
            },
            55: {
                description: "Heavy drizzle",
                icon: "weather-pouring",
            },
            56: {
                description: "Light freezing drizzle",
                icon: "weather-snowy-rainy",
            },
            57: {
                description: "Heavy freezing drizzle",
                icon: "weather-snowy-rainy",
            },
            61: {
                description: "Light rain",
                icon: "weather-rainy",
            },
            63: {
                description: "Moderate rain",
                icon: "weather-rainy",
            },
            65: {
                description: "Heavy rain",
                icon: "weather-pouring",
            },
            66: {
                description: "Light freezing rain",
                icon: "weather-snowy-rainy",
            },
            67: {
                description: "Heavy freezing rain",
                icon: "weather-snowy-rainy",
            },
            71: {
                description: "Light snow",
                icon: "weather-snowy",
            },
            73: {
                description: "Moderate snow",
                icon: "weather-snowy",
            },
            75: {
                description: "Heavy snow",
                icon: "weather-snowy-heavy",
            },
            77: {
                description: "Snow grains",
                icon: "weather-snowy",
            },
            80: {
                description: "Light rain showers",
                icon: "weather-rainy",
            },
            81: {
                description: "Moderate rain showers",
                icon: "weather-rainy",
            },
            82: {
                description: "Heavy rain showers",
                icon: "weather-pouring",
            },
            85: {
                description: "Light snow showers",
                icon: "weather-snowy",
            },
            86: {
                description: "Heavy snow showers",
                icon: "weather-snowy-heavy",
            },
            95: {
                description: "Thunderstorm",
                icon: "weather-lightning",
            },
            96: {
                description: "Thunderstorm with light hail",
                icon: "weather-lightning-rainy",
            },
            99: {
                description: "Thunderstorm with heavy hail",
                icon: "weather-hail",
            },
        };

        const defaultInfo = {
            description: "Unknown",
            icon: "weather-cloudy",
        };

        return weatherMap[weatherCode] || defaultInfo;
    };

    // Format temperature
    const formatTemperature = (celsius: number) => {
        return `${Math.round(celsius)}°C`;
    };

    // Calculate add location panel position
    const addLocationPanelHeight = addLocationAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    });

    // Calculate map panel position
    const mapPanelHeight = mapAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get("window").height * 0.7],
    });

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Render location item
    const renderLocationItem = ({ item }: { item: SavedLocation }) => {
        const weatherInfo = item.weather
            ? getWeatherInfo(item.weather.weathercode, item.weather.is_day)
            : null;

        return (
            <View style={styles.locationCard}>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationDate}>
                        Saved on {formatDate(item.created_at)}
                    </Text>
                </View>

                {/* Weather information */}
                <View style={styles.weatherInfo}>
                    {item.isLoadingWeather ? (
                        <ActivityIndicator size="small" color="#4da0b0" />
                    ) : item.weather ? (
                        <>
                            <View style={styles.weatherIconContainer}>
                                <Icon
                                    name={weatherInfo?.icon || "weather-cloudy"}
                                    size={24}
                                    color="#4da0b0"
                                />
                                <Text style={styles.weatherDescription}>
                                    {weatherInfo?.description}
                                </Text>
                            </View>
                            <Text style={styles.temperature}>
                                {formatTemperature(item.weather.temperature)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.weatherUnavailable}>
                            Weather unavailable
                        </Text>
                    )}
                </View>

                <View style={styles.locationActions}>
                    <TouchableOpacity
                        style={styles.locationAction}
                        onPress={() => toggleMap(item)}
                    >
                        <Icon name="map" size={20} color="#4da0b0" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.locationAction}
                        onPress={() => viewWeather(item)}
                    >
                        <Icon
                            name="weather-partly-cloudy"
                            size={20}
                            color="#4da0b0"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.locationAction}
                        onPress={() => {
                            Alert.alert(
                                "Delete Location",
                                `Are you sure you want to delete ${item.name}?`,
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        onPress: () => deleteLocation(item.id),
                                        style: "destructive",
                                    },
                                ]
                            );
                        }}
                    >
                        <Icon name="delete" size={20} color="#e53e3e" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon
                name="map-marker-off"
                size={50}
                color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.emptyStateText}>
                You haven't saved any locations yet.
            </Text>
            <Text style={styles.emptyStateSubtext}>
                Add locations to quickly access weather forecasts.
            </Text>
        </View>
    );

    // Render search result item
    const renderSearchResultItem = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => saveLocation(item)}
        >
            <Icon name="map-marker" size={20} color="#666" />
            <View style={styles.searchResultTextContainer}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultCountry}>{item.country}</Text>
            </View>
            <Icon name="plus-circle" size={20} color="#3182CE" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3182CE" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <LinearGradient
                    colors={["#4da0b0", "#d39d38"]}
                    style={styles.gradientBackground}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.welcomeText}>
                                Welcome back,
                            </Text>
                            <Text style={styles.nameText}>{fullName}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Icon name="logout" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Main content - Using FlatList as the main scrollable container */}
                    <View style={styles.content}>
                        {/* Section Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Your Saved Locations
                            </Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={toggleAddLocation}
                            >
                                <Icon name="plus" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Current Location Button */}
                        <TouchableOpacity
                            style={styles.currentLocationButton}
                            onPress={getCurrentLocation}
                        >
                            <Icon
                                name="crosshairs-gps"
                                size={20}
                                color="white"
                            />
                            <Text style={styles.currentLocationText}>
                                Save Current Location
                            </Text>
                        </TouchableOpacity>

                        {/* Saved Locations List */}
                        {loadingLocations ? (
                            <ActivityIndicator
                                style={styles.locationsLoading}
                                color="white"
                            />
                        ) : (
                            <FlatList
                                data={savedLocations}
                                keyExtractor={(item) => item.id}
                                renderItem={renderLocationItem}
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                contentContainerStyle={styles.locationsList}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={renderEmptyState}
                                ListFooterComponent={
                                    <View style={styles.appInfo}>
                                        <Text style={styles.appInfoText}>
                                            Weather App v1.0
                                        </Text>
                                        <Text style={styles.appInfoSubtext}>
                                            Powered by Open-Meteo API
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>

                    {/* Add Location Panel */}
                    <Animated.View
                        style={[
                            styles.addLocationPanel,
                            { height: addLocationPanelHeight },
                        ]}
                    >
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Add Location</Text>
                            <TouchableOpacity onPress={toggleAddLocation}>
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
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    searchLocations(text);
                                }}
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
                                color="#3182CE"
                            />
                        ) : (
                            <FlatList
                                data={searchResults}
                                keyExtractor={(item) =>
                                    `${item.name}-${item.latitude}-${item.longitude}`
                                }
                                renderItem={renderSearchResultItem}
                                ListEmptyComponent={
                                    searchQuery.length > 0 ? (
                                        <Text style={styles.noResultsText}>
                                            No locations found. Try a different
                                            search term.
                                        </Text>
                                    ) : (
                                        <Text style={styles.searchPromptText}>
                                            Search for a city to add to your
                                            saved locations.
                                        </Text>
                                    )
                                }
                            />
                        )}
                    </Animated.View>

                    {/* Map Panel */}
                    <Animated.View
                        style={[styles.mapPanel, { height: mapPanelHeight }]}
                    >
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>
                                {selectedLocation
                                    ? selectedLocation.name
                                    : "Location Map"}
                            </Text>
                            <TouchableOpacity onPress={() => toggleMap()}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {showMap && selectedLocation && (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: selectedLocation.latitude,
                                    longitude: selectedLocation.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: selectedLocation.latitude,
                                        longitude: selectedLocation.longitude,
                                    }}
                                    title={selectedLocation.name}
                                >
                                    <View style={styles.markerContainer}>
                                        <Icon
                                            name="map-marker"
                                            size={24}
                                            color="#3182CE"
                                        />
                                    </View>
                                </Marker>
                            </MapView>
                        )}

                        {showMap && selectedLocation && (
                            <View style={styles.mapActions}>
                                <TouchableOpacity
                                    style={styles.mapActionButton}
                                    onPress={() =>
                                        viewWeather(selectedLocation)
                                    }
                                >
                                    <Icon
                                        name="weather-partly-cloudy"
                                        size={20}
                                        color="white"
                                    />
                                    <Text style={styles.mapActionText}>
                                        View Weather
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBF8FF",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#4A5568",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    welcomeText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
    },
    nameText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    logoutButton: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: 10,
        borderRadius: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    addButton: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: 8,
        borderRadius: 16,
    },
    currentLocationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 15,
    },
    currentLocationText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 8,
    },
    locationsLoading: {
        marginTop: 20,
        alignSelf: "center",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: 12,
        padding: 30,
        marginTop: 10,
    },
    emptyStateText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        marginTop: 15,
        textAlign: "center",
    },
    emptyStateSubtext: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 14,
        marginTop: 5,
        textAlign: "center",
    },
    locationsList: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    locationCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    locationInfo: {
        marginBottom: 10,
    },
    locationName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 4,
    },
    locationDate: {
        fontSize: 12,
        color: "#718096",
    },
    weatherInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#EDF2F7",
        marginBottom: 10,
    },
    weatherIconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    weatherDescription: {
        fontSize: 14,
        color: "#4A5568",
        marginLeft: 8,
    },
    temperature: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4da0b0",
    },
    weatherUnavailable: {
        fontSize: 14,
        color: "#A0AEC0",
        fontStyle: "italic",
    },
    locationActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    locationAction: {
        padding: 8,
        marginLeft: 10,
    },
    appInfo: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 20,
    },
    appInfoText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
    },
    appInfoSubtext: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 12,
        marginTop: 4,
    },
    addLocationPanel: {
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
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    panelTitle: {
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
        alignSelf: "center",
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
        flex: 1,
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
    searchPromptText: {
        textAlign: "center",
        padding: 20,
        color: "#666",
        fontStyle: "italic",
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
    map: {
        flex: 1,
    },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#3182CE",
    },
    mapActions: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    mapActionButton: {
        backgroundColor: "#3182CE",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    mapActionText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
});

export default Welcome;
