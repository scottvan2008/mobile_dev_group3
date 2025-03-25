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

interface WeatherData {
    temperature: number;
    weathercode: number;
    is_day: number;
}
interface SavedLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    created_at: string;
    weather?: WeatherData;
    isLoadingWeather?: boolean;
}
interface SearchResult {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}
interface WeatherInfo {
    description: string;
    icon: string;
}

const Welcome: React.FC = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] =
        useState<SavedLocation | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const mapAnim = useRef(new Animated.Value(0)).current;
    const addLocAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchUserDetails();
    }, []);

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
            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userData.user.id)
                .single();
            if (error || !data)
                Alert.alert("Error", "Unable to fetch user details.");
            else setFullName(`${data.first_name} ${data.last_name}`);
            await fetchSavedLocations(userData.user.id);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedLocations = async (uid: string) => {
        try {
            setLoadingLocations(true);
            const { data, error } = await supabase
                .from("saved_locations")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });
            if (error)
                Alert.alert("Error", "Unable to fetch your saved locations.");
            else {
                const locs = (data || []).map((loc: any) => ({
                    ...loc,
                    isLoadingWeather: true,
                }));
                setSavedLocations(locs);
                if (locs.length) fetchWeatherForLocations(locs);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingLocations(false);
            setRefreshing(false);
        }
    };

    const fetchWeatherForLocations = async (locs: SavedLocation[]) => {
        const updated = [...locs];
        const batchSize = 3;
        for (let i = 0; i < updated.length; i += batchSize) {
            const batch = updated.slice(i, i + batchSize);
            await Promise.all(
                batch.map((loc) =>
                    fetchWeatherForLocation(loc.latitude, loc.longitude)
                        .then((weather) => {
                            const idx = updated.findIndex(
                                (l) => l.id === loc.id
                            );
                            if (idx !== -1)
                                updated[idx] = {
                                    ...updated[idx],
                                    weather: weather ?? undefined,
                                    isLoadingWeather: false,
                                };
                        })
                        .catch((err) => {
                            console.error(err);
                            const idx = updated.findIndex(
                                (l) => l.id === loc.id
                            );
                            if (idx !== -1)
                                updated[idx] = {
                                    ...updated[idx],
                                    isLoadingWeather: false,
                                };
                        })
                )
            );
            setSavedLocations([...updated]);
        }
    };

    const fetchWeatherForLocation = async (
        lat: number,
        lon: number
    ): Promise<WeatherData | null> => {
        try {
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day&timezone=auto`
            );
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            const data = await res.json();
            return {
                temperature: data.current.temperature_2m,
                weathercode: data.current.weathercode,
                is_day: data.current.is_day,
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        userId ? fetchSavedLocations(userId) : setRefreshing(false);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert("Error", "Failed to sign out.");
                return;
            }
            router.push("/");
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    const toggleAddLocation = () => {
        setSearchQuery("");
        setSearchResults([]);
        Animated.timing(addLocAnim, {
            toValue: showAddLocation ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowAddLocation(!showAddLocation);
    };

    const toggleMap = (loc?: SavedLocation) => {
        setSelectedLocation(loc || null);
        Animated.timing(mapAnim, {
            toValue: showMap ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowMap(!showMap);
    };

    const searchLocations = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
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
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const saveLocation = async (loc: SearchResult) => {
        if (!userId) return;
        try {
            const locName = `${loc.name}, ${loc.country}`;
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
            if (error) Alert.alert("Error", "Unable to save location.");
            else {
                Alert.alert("Success", `${locName} saved.`);
                fetchSavedLocations(userId);
                toggleAddLocation();
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Unexpected error.");
        }
    };

    const deleteLocation = async (locId: string) => {
        try {
            const { error } = await supabase
                .from("saved_locations")
                .delete()
                .eq("id", locId);
            if (error) Alert.alert("Error", "Unable to delete location.");
            else if (userId) fetchSavedLocations(userId);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Unexpected error.");
        }
    };

    const viewWeather = (loc: SavedLocation) => {
        router.push({
            pathname: "/tabs/weatherinfo",
            params: {
                latitude: loc.latitude.toString(),
                longitude: loc.longitude.toString(),
                locationName: loc.name,
            },
        });
    };

    const getCurrentLocation = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Location permission required."
                );
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;
            const rev = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });
            if (rev.length && userId) {
                const address = rev[0];
                const locName = [address.city, address.region, address.country]
                    .filter(Boolean)
                    .join(", ");
                const { error } = await supabase
                    .from("saved_locations")
                    .insert([
                        {
                            user_id: userId,
                            name: locName || "Current Location",
                            latitude,
                            longitude,
                        },
                    ])
                    .select();
                if (error)
                    Alert.alert(
                        "Error",
                        "Unable to save your current location."
                    );
                else {
                    Alert.alert("Success", "Current location saved.");
                    fetchSavedLocations(userId);
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Unable to get your current location.");
        }
    };

    const getWeatherInfo = (code: number, isDay = 1): WeatherInfo => {
        const map: { [key: number]: WeatherInfo } = {
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
            3: { description: "Overcast", icon: "weather-cloudy" },
            45: { description: "Fog", icon: "weather-fog" },
            48: { description: "Depositing rime fog", icon: "weather-fog" },
            51: { description: "Light drizzle", icon: "weather-rainy" },
            53: { description: "Moderate drizzle", icon: "weather-rainy" },
            55: { description: "Heavy drizzle", icon: "weather-pouring" },
            56: {
                description: "Light freezing drizzle",
                icon: "weather-snowy-rainy",
            },
            57: {
                description: "Heavy freezing drizzle",
                icon: "weather-snowy-rainy",
            },
            61: { description: "Light rain", icon: "weather-rainy" },
            63: { description: "Moderate rain", icon: "weather-rainy" },
            65: { description: "Heavy rain", icon: "weather-pouring" },
            66: {
                description: "Light freezing rain",
                icon: "weather-snowy-rainy",
            },
            67: {
                description: "Heavy freezing rain",
                icon: "weather-snowy-rainy",
            },
            71: { description: "Light snow", icon: "weather-snowy" },
            73: { description: "Moderate snow", icon: "weather-snowy" },
            75: { description: "Heavy snow", icon: "weather-snowy-heavy" },
            77: { description: "Snow grains", icon: "weather-snowy" },
            80: { description: "Light rain showers", icon: "weather-rainy" },
            81: { description: "Moderate rain showers", icon: "weather-rainy" },
            82: { description: "Heavy rain showers", icon: "weather-pouring" },
            85: { description: "Light snow showers", icon: "weather-snowy" },
            86: {
                description: "Heavy snow showers",
                icon: "weather-snowy-heavy",
            },
            95: { description: "Thunderstorm", icon: "weather-lightning" },
            96: {
                description: "Thunderstorm with light hail",
                icon: "weather-lightning-rainy",
            },
            99: {
                description: "Thunderstorm with heavy hail",
                icon: "weather-hail",
            },
        };
        return map[code] || { description: "Unknown", icon: "weather-cloudy" };
    };

    const formatTemperature = (c: number) => `${Math.round(c)}°C`;
    const addLocPanelHeight = addLocAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    });
    const mapPanelHeight = mapAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Dimensions.get("window").height * 0.7],
    });
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const renderLocationItem = ({ item }: { item: SavedLocation }) => {
            const info = item.weather
                ? getWeatherInfo(item.weather.weathercode, item.weather.is_day)
                : null;
            return (
                <TouchableOpacity 
                    onPress={() => viewWeather(item)}
                    style={styles.locationCard}
                >
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{item.name}</Text>
                        <Text style={styles.locationDate}>
                            Saved on {formatDate(item.created_at)}
                        </Text>
                    </View>
                    <View style={styles.weatherInfo}>
                        {item.isLoadingWeather ? (
                            <ActivityIndicator size="small" color="#4da0b0" />
                        ) : item.weather ? (
                            <>
                                <View style={styles.weatherIconContainer}>
                                    <Icon
                                        name={info?.icon || "weather-cloudy"}
                                        size={24}
                                        color="#4da0b0"
                                    />
                                    <Text style={styles.weatherDescription}>
                                        {info?.description}
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
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleMap(item);
                            }}
                        >
                            <Icon name="map" size={20} color="#4da0b0" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.locationAction}
                            onPress={(e) => {
                                e.stopPropagation();
                                viewWeather(item);
                            }}
                        >
                            <Icon
                                name="weather-partly-cloudy"
                                size={20}
                                color="#4da0b0"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.locationAction}
                            onPress={(e) => {
                                e.stopPropagation();
                                Alert.alert(
                                    "Delete Location",
                                    `Delete ${item.name}?`,
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
                </TouchableOpacity>
            );
        };
    
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

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3182CE" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );

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
                    <View style={styles.content}>
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
                    <Animated.View
                        style={[
                            styles.addLocationPanel,
                            { height: addLocPanelHeight },
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
    safeArea: { flex: 1 },
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBF8FF",
    },
    loadingText: { marginTop: 12, fontSize: 16, color: "#4A5568" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    welcomeText: { fontSize: 16, color: "rgba(255,255,255,0.9)" },
    nameText: { fontSize: 24, fontWeight: "bold", color: "white" },
    logoutButton: {
        backgroundColor: "rgba(0,0,0,0.2)",
        padding: 10,
        borderRadius: 20,
    },
    content: { flex: 1, paddingHorizontal: 20 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 15,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
    addButton: {
        backgroundColor: "rgba(0,0,0,0.2)",
        padding: 8,
        borderRadius: 16,
    },
    currentLocationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
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
    locationsLoading: { marginTop: 20, alignSelf: "center" },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.1)",
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
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        marginTop: 5,
        textAlign: "center",
    },
    locationsList: { paddingBottom: 20, flexGrow: 1 },
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
    locationInfo: { marginBottom: 10 },
    locationName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 4,
    },
    locationDate: { fontSize: 12, color: "#718096" },
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
    weatherIconContainer: { flexDirection: "row", alignItems: "center" },
    weatherDescription: { fontSize: 14, color: "#4A5568", marginLeft: 8 },
    temperature: { fontSize: 18, fontWeight: "bold", color: "#4da0b0" },
    weatherUnavailable: { fontSize: 14, color: "#A0AEC0", fontStyle: "italic" },
    locationActions: { flexDirection: "row", justifyContent: "flex-end" },
    locationAction: { padding: 8, marginLeft: 10 },
    appInfo: { alignItems: "center", marginTop: 30, marginBottom: 20 },
    appInfoText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
    appInfoSubtext: {
        color: "rgba(255,255,255,0.6)",
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
    panelTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
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
    searchLoading: { marginTop: 20, alignSelf: "center" },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchResultTextContainer: { flex: 1, marginLeft: 12 },
    searchResultName: { fontSize: 16, color: "#333" },
    searchResultCountry: { fontSize: 14, color: "#666" },
    noResultsText: { textAlign: "center", padding: 20, color: "#666" },
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
    map: { flex: 1 },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#3182CE",
    },
    mapActions: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee" },
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
