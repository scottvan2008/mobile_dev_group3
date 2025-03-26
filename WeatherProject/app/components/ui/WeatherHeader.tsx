import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import type { LocationData } from "@/types/weather";

interface WeatherHeaderProps {
    location: LocationData;
    onSearchPress: () => void;
    onMapPress: () => void;
    useCelsius: boolean;
    onToggleUnit: () => void;
    onAddLocation?: () => void;
    isLocationSaved?: boolean;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export function WeatherHeader({
    location,
    onSearchPress,
    onMapPress,
    useCelsius,
    onToggleUnit,
    onAddLocation,
    isLocationSaved = false,
    showBackButton = false,
    onBackPress,
}: WeatherHeaderProps) {
    return (
        <View style={styles.header}>
            {showBackButton ? (
                <TouchableOpacity
                    onPress={onBackPress}
                    style={styles.iconButton}
                >
                    <Icon name="home" size={22} color="white" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={onSearchPress}
                    style={styles.iconButton}
                >
                    <Icon name="magnify" size={22} color="white" />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                onPress={onMapPress}
                style={styles.locationButton}
            >
                <Icon name="map-marker" size={18} color="white" />
                <Text style={styles.locationText} numberOfLines={1}>
                    {location.name}
                </Text>
                <Icon name="chevron-down" size={18} color="white" />
            </TouchableOpacity>
            <View style={styles.headerRightButtons}>
                {onAddLocation && !isLocationSaved && (
                    <TouchableOpacity
                        onPress={onAddLocation}
                        style={styles.addButton}
                    >
                        <Icon name="plus" size={18} color="white" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={onToggleUnit}
                    style={styles.unitButton}
                >
                    <Text style={styles.unitText}>
                        {useCelsius ? "°C" : "°F"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
