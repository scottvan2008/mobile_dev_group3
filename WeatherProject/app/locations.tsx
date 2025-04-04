"use client";

import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    Animated,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../src/supabase";
import { useAuth } from "../src/hooks/useAuth";
import { useLocationSearch } from "../src/hooks/useLocationSearch";
import { useLocationManagement } from "../src/hooks/useLocationManagement";
import { useSavedLocations } from "../src/hooks/useSavedLocations";
import type { SavedLocation } from "../src/types/weather";
import { LocationCard } from "../src/components/locations/LocationCard";
import { useAlert } from "../src/context/AlertContext";

export default function Locations() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [selectedLocation, setSelectedLocation] =
        useState<SavedLocation | null>(null);

    const mapAnim = useRef(new Animated.Value(0)).current;

    const { isSignedIn, userId, isProcessingAction, setIsProcessingAction } =
        useAuth();

    const { searchQuery, setSearchQuery, searchResults, isSearching } =
        useLocationSearch();

    const { saveLocation, deleteLocation } = useLocationManagement(
        userId,
        isSignedIn
    );

    const {
        savedLocations,
        loadingLocations,
        refreshing,
        fetchSavedLocations,
        handleRefresh,
    } = useSavedLocations(userId);

    const { showAlert } = useAlert();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const { data: userData, error: userError } =
                await supabase.auth.getUser();
            if (userError || !userData.user) {
                showAlert({
                    title: "Error",
                    message: "Unable to fetch user data.",
                    type: "error",
                });
                router.push("/");
                return;
            }

            const { data, error } = await supabase
                .from("user_details")
                .select("first_name, last_name")
                .eq("uuid", userData.user.id)
                .single();
            if (error || !data)
                showAlert({
                    title: "Error",
                    message: "Unable to fetch user details.",
                    type: "error",
                });
            else setFullName(`${data.first_name} ${data.last_name}`);

            await fetchSavedLocations(userData.user.id);
        } catch (e) {
            console.error(e);
            showAlert({
                title: "Error",
                message: "An unexpected error occurred.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
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

    const handleDeleteLocation = async (locId: string) => {
        const success = await deleteLocation(locId);
        if (success && userId) {
            fetchSavedLocations(userId);
        }
    };

    const handleSaveLocation = async (loc: any) => {
        const success = await saveLocation(loc);
        if (success && userId) {
            showAlert({
                title: "Success",
                message: `${loc.name}, ${loc.country} has been added to your saved locations.`,
                type: "success",
                autoClose: true,
            });
            fetchSavedLocations(userId);
            setSearchQuery("");
        }
    };

    const viewWeather = (loc: SavedLocation) => {
        if (isProcessingAction) return;

        setIsProcessingAction(true);
        router.push({
            pathname: "/",
            params: {
                latitude: loc.latitude.toString(),
                longitude: loc.longitude.toString(),
                locationName: loc.name,
            },
        });
        setTimeout(() => {
            setIsProcessingAction(false);
        }, 1000);
    };

    const renderSearchResultItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => handleSaveLocation(item)}
        >
            <Icon name="map-marker" size={20} color="#666" />
            <View style={styles.searchResultTextContainer}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultCountry}>{item.country}</Text>
            </View>
            <Icon name="plus-circle" size={20} color="#4FC3F7" />
        </TouchableOpacity>
    );

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

    const mapPanelHeight = mapAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Platform.OS === "ios" ? 500 : 400],
    });

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4FC3F7" />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );

    const gradientColors = ["#4A90E2", "#48D1CC"] as const;

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
                    { backgroundColor: gradientColors[0] },
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <LinearGradient
                        colors={[...gradientColors]}
                        style={styles.gradientBackground}
                    >
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.welcomeText}>
                                    Welcome back,
                                </Text>
                                <Text style={styles.nameText}>{fullName}</Text>
                            </View>
                            <View style={styles.headerButtons}>
                                <TouchableOpacity
                                    style={styles.homeButton}
                                    onPress={() => router.push("/")}
                                >
                                    <Icon name="home" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.content}>
                            <View style={styles.searchInputContainer}>
                                <Icon
                                    name="magnify"
                                    size={20}
                                    color="#666"
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search for a city to add..."
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
                                <View style={styles.searchResultsContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color="white"
                                    />
                                    <Text style={styles.searchingText}>
                                        Searching...
                                    </Text>
                                </View>
                            ) : searchResults.length > 0 ? (
                                <View style={styles.searchResultsContainer}>
                                    <FlatList
                                        data={searchResults}
                                        keyExtractor={(item) =>
                                            `${item.name}-${item.latitude}-${item.longitude}`
                                        }
                                        renderItem={renderSearchResultItem}
                                        style={styles.searchResultsList}
                                    />
                                </View>
                            ) : searchQuery.length > 0 ? (
                                <View style={styles.searchResultsContainer}>
                                    <Text style={styles.noResultsText}>
                                        No locations found. Try a different
                                        search term.
                                    </Text>
                                </View>
                            ) : null}

                            {loadingLocations ? (
                                <ActivityIndicator
                                    style={styles.locationsLoading}
                                    color="white"
                                />
                            ) : (
                                <FlatList
                                    data={savedLocations}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <LocationCard
                                            location={item}
                                            viewWeather={viewWeather}
                                            deleteLocation={
                                                handleDeleteLocation
                                            }
                                        />
                                    )}
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
                                styles.mapPanel,
                                { height: mapPanelHeight },
                            ]}
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
                                            longitude:
                                                selectedLocation.longitude,
                                        }}
                                        title={selectedLocation.name}
                                    >
                                        <View style={styles.markerContainer}>
                                            <Icon
                                                name="map-marker"
                                                size={24}
                                                color="#4FC3F7"
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
        paddingTop: 10,
        paddingBottom: 8,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    homeButton: {
        backgroundColor: "rgba(0,0,0,0.2)",
        padding: 8,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    welcomeText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.9)",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    nameText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    clearButton: { padding: 4 },
    searchResultsContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
        maxHeight: 200,
    },
    searchResultsList: {
        maxHeight: 180,
    },
    searchingText: {
        textAlign: "center",
        padding: 10,
        color: "#666",
    },
    noResultsText: {
        textAlign: "center",
        padding: 10,
        color: "#666",
    },
    searchResultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchResultTextContainer: { flex: 1, marginLeft: 12 },
    searchResultName: { fontSize: 16, color: "#333" },
    searchResultCountry: { fontSize: 14, color: "#666" },
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
    appInfo: { alignItems: "center", marginTop: 30, marginBottom: 20 },
    appInfoText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
    appInfoSubtext: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        marginTop: 4,
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
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    panelTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    map: { flex: 1 },
    markerContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 6,
        borderWidth: 2,
        borderColor: "#4FC3F7",
    },
    mapActions: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee" },
    mapActionButton: {
        backgroundColor: "#4FC3F7",
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
