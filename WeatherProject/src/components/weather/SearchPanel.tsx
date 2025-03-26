import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import type { SearchResult } from "../../types/weather"

interface SearchPanelProps {
  showSearch: boolean
  searchAnimation: Animated.Value
  searchQuery: string
  setSearchQuery: (query: string) => void
  isSearching: boolean
  searchResults: SearchResult[]
  toggleSearch: () => void
  selectLocation: (location: SearchResult) => void
}

export const SearchPanel = ({
  showSearch,
  searchAnimation,
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  toggleSearch,
  selectLocation,
}: SearchPanelProps) => {
  const searchPanelHeight = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350],
  })

  return (
    <Animated.View style={[styles.searchPanel, { height: searchPanelHeight }]}>
      <View style={styles.searchHeader}>
        <Text style={styles.searchTitle}>Search Location</Text>
        <TouchableOpacity onPress={toggleSearch}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchInputContainer}>
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Icon name="close-circle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {isSearching ? (
        <ActivityIndicator style={styles.searchLoading} color="#4FC3F7" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => `${item.name}-${item.latitude}-${item.longitude}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultItem} onPress={() => selectLocation(item)}>
              <Icon name="map-marker" size={20} color="#4FC3F7" />
              <View style={styles.searchResultTextContainer}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultCountry}>{item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <Text style={styles.noResultsText}>No locations found. Try a different search term.</Text>
            ) : null
          }
        />
      )}
    </Animated.View>
  )
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
})

