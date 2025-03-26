import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
}: SearchBarProps) {
    return (
        <View style={styles.searchInputContainer}>
            <Icon
                name="magnify"
                size={20}
                color="#666"
                style={styles.searchIcon}
            />
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize="words"
            />
            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() => onChangeText("")}
                    style={styles.clearButton}
                >
                    <Icon name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.1)",
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#333",
    },
    clearButton: { padding: 4 },
});
