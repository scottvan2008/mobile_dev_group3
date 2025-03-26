import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import type { SavedLocation } from "../../types/weather";
import { getWeatherInfo, formatTemperature } from "../../utils/weather";
import { useAlert } from "../../context/AlertContext";

interface LocationCardProps {
    location: SavedLocation;
    viewWeather: (location: SavedLocation) => void;
    deleteLocation: (id: string) => void;
}

export const LocationCard = ({
    location,
    viewWeather,
    deleteLocation,
}: LocationCardProps) => {
    const { showAlert } = useAlert();
    const weatherInfo = location.weather
        ? getWeatherInfo(location.weather.weathercode, location.weather.is_day)
        : null;

    const handleDelete = (e: any) => {
        e.stopPropagation();
        showAlert({
            title: "Delete Location",
            message: `Are you sure you want to delete ${location.name}?`,
            type: "warning",
            buttons: [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {},
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteLocation(location.id),
                },
            ],
        });
    };

    return (
        <TouchableOpacity
            onPress={() => viewWeather(location)}
            style={styles.locationCardContainer}
        >
            {weatherInfo ? (
                <LinearGradient
                    colors={[...weatherInfo.gradient]}
                    style={styles.locationCard}
                >
                    <View style={styles.locationCardContent}>
                        <View style={styles.locationHeader}>
                            <Text style={styles.locationName}>
                                {location.name}
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Icon
                                    name="delete"
                                    size={20}
                                    color="rgba(255, 255, 255, 0.8)"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weatherInfo}>
                            {location.isLoadingWeather ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : location.weather ? (
                                <View style={styles.weatherContent}>
                                    <Icon
                                        name={weatherInfo.icon}
                                        size={32}
                                        color="white"
                                        style={styles.weatherIcon}
                                    />
                                    <View style={styles.weatherDetails}>
                                        <Text style={styles.weatherDescription}>
                                            {weatherInfo.description}
                                        </Text>
                                        <View style={styles.temperatureRow}>
                                            <Text style={styles.temperature}>
                                                {formatTemperature(
                                                    location.weather.temperature
                                                )}
                                            </Text>
                                            {location.weather
                                                .temperature_max !==
                                                undefined &&
                                                location.weather
                                                    .temperature_min !==
                                                    undefined && (
                                                    <Text
                                                        style={styles.tempRange}
                                                    >
                                                        {formatTemperature(
                                                            location.weather
                                                                .temperature_min
                                                        )}{" "}
                                                        -{" "}
                                                        {formatTemperature(
                                                            location.weather
                                                                .temperature_max
                                                        )}
                                                    </Text>
                                                )}
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.weatherUnavailable}>
                                    Weather unavailable
                                </Text>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            ) : (
                <View
                    style={[
                        styles.locationCard,
                        { backgroundColor: "#4A90E2" },
                    ]}
                >
                    <View style={styles.locationCardContent}>
                        <View style={styles.locationHeader}>
                            <Text style={styles.locationName}>
                                {location.name}
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Icon
                                    name="delete"
                                    size={20}
                                    color="rgba(255, 255, 255, 0.8)"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weatherInfo}>
                            {location.isLoadingWeather ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.weatherUnavailable}>
                                    Weather unavailable
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    locationCardContainer: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    locationCard: {
        borderRadius: 16,
        overflow: "hidden",
    },
    locationCardContent: {
        padding: 14,
    },
    locationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    locationName: {
        fontSize: 18,
        fontWeight: "700",
        color: "white",
        flex: 1,
        paddingRight: 8,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    weatherInfo: {
        marginTop: 0,
    },
    weatherContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    weatherIcon: {
        marginRight: 12,
    },
    weatherDetails: {
        flex: 1,
    },
    weatherDescription: {
        fontSize: 14,
        color: "white",
        fontWeight: "500",
        marginBottom: 4,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    temperatureRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    temperature: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginRight: 8,
    },
    tempRange: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "500",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    deleteButton: {
        backgroundColor: "rgba(229, 62, 62, 0.3)",
        borderRadius: 20,
        padding: 8,
    },
    weatherUnavailable: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        fontStyle: "italic",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
