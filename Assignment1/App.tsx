import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

// Mock data for the images
const images = [
  { id: "1", uri: "https://static.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg" },
  { id: "2", uri: "https://th.bing.com/th/id/OIP.hfLsOOvzTlqSpjl7L0UUZgAAAA?rs=1&pid=ImgDetMain" },
  { id: "3", uri: "https://worldanimalfoundation.org/wp-content/uploads/2023/09/Cute-dogs.jpg" },
  { id: "4", uri: "https://i2.wp.com/earthnworld.com/wp-content/uploads/2017/07/Red-Panda.jpg?ssl=1" },
  { id: "5", uri: "https://th.bing.com/th/id/OIP._iDohgoNxsNxRFIVwrAsbQHaEo?rs=1&pid=ImgDetMain" },
  { id: "6", uri: "https://th.bing.com/th/id/OIP.WWW36tVL6_TXJgn7EShHpAHaE8?rs=1&pid=ImgDetMain" },
  { id: "7", uri: "https://i.pinimg.com/originals/2e/04/98/2e04984f5f52a0913faef89ea965627c.jpg" },
  { id: "8", uri: "https://th.bing.com/th/id/OIP.Mh3bu2ExP3pLUfgTBLgu9QHaFj?rs=1&pid=ImgDetMain" },
  { id: "9", uri: "https://th.bing.com/th/id/OIP.nj4VqeQLfhTMaXMXC24VbAHaEt?rs=1&pid=ImgDetMain" },
];

const ImageGrid = () => {
  const renderItem = ({ item }: { item: { id: string; uri: string } }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </View>
  );

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={3}
      showsVerticalScrollIndicator={false}
    />
  );
};

// Top Section Component
const TopSection = () => {
  return (
    <View style={styles.topSection}>
      {/* Header */}
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => alert('Go Back!')}>
          <Ionicons name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
      {/* Title and Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.text}>Group Profile</Text>
        <Text style={styles.subtitle}>ootd_everyday</Text>
      </View>
    </View>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: "https://pngimg.com/uploads/circle/circle_PNG50.png" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>OOTD Everyday</Text>
        <Text style={styles.profileDescription}>Fit check! 👕👗 {"\n"}You know we’ll hype you up.</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>53</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      {/* Dropdown Section */}
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>Member ▼</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Home Screen
function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Top Section */}
      <TopSection />
      {/* Image Grid */}
      <ImageGrid />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Search") {
              iconName = "search-outline";
            } else if (route.name === "Add Post") {
              iconName = "add-circle-outline";
            } else if (route.name === "Notifications") {
              iconName = "notifications-outline";
            } else if (route.name === "Profile") {
              iconName = "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: "#fff", height: 60 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={HomeScreen} />
        <Tab.Screen
          name="Alert"
          component={HomeScreen}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                style={styles.alertButton}
                onPress={() => Alert.alert("Alert Button Pressed")}
              >
                <Ionicons name="alert-circle-outline" size={30} color="#fff" />
                <Text style={styles.alertButtonText}>Alert</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen name="Notifications" component={HomeScreen} />
        <Tab.Screen name="Profile" component={HomeScreen} />
      </Tab.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: -20
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginLeft: -20,
    marginBottom: 10
  },
  backButton: {
    marginTop:-10 ,
  },
  topSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: 30,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  profileDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  dropdown: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 14,
    color: "#000",
  },
  imageContainer: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: Dimensions.get("window").width / 3 - 10,
    height: Dimensions.get("window").width / 3 - 10,
    borderRadius: 5,
  },
  alertButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    height: 60,
    width: 60,
    position: "absolute",
    marginLeft: 10,
  
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
});