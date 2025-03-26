"use client";

import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { SearchBar } from "./SearchBar";
import type { SearchResult } from "@/types/weather";

interface SearchPanelProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (location: SearchResult) => void;
}

export function SearchPanel({
    visible,
    onClose,
    onSelectLocation,
}: SearchPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchAnimation = useState(new Animated.Value(visible ? 1 : 0))[0];

    useEffect(() => {
        Animated.timing(searchAnimation, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [visible]);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchQuery.trim().length >= 2
                ? searchLocations(searchQuery.trim())
                : setSearchResults([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    const handleSelectLocation = (location: SearchResult) => {
        onSelectLocation(location);
        setSearchQuery("");
        setSearchResults([]);
        onClose();
    };

    const searchPanelHeight = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 350],
    });

    return (
        <Animated.View
            style={[styles.searchPanel, { height: searchPanelHeight }]}
        >
            <View style={styles.searchHeader}>
                <Text style={styles.searchTitle}>Search Location</Text>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
            </View>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for a city..."
            />
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
                            onPress={() => handleSelectLocation(item)}
                        >
                            <Icon name="map-marker" size={20} color="#4FC3F7" />
                            <View style={styles.searchResultTextContainer}>
                                <Text style={styles.searchResultName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.searchResultCountry}>
                                    {item.country}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        searchQuery.length > 0 ? (
                            <Text style={styles.noResultsText}>
                                No locations found. Try a different search term.
                            </Text>
                        ) : null
                    }
                />
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
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
});
