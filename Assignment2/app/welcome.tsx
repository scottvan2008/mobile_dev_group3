import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface WelcomeProps {
  username: string;
}

interface CityTabProps {
  city: string;
  imageUrl: string;
  link: string;
}

const CityTab: React.FC<CityTabProps> = ({ city, imageUrl, link }) => {
  const router = useRouter();

  return (
    <View style={styles.cityContainer}>
      <Text style={styles.cityText}>{city}</Text>
      <Image source={{ uri: imageUrl }} style={styles.cityImage} />
      <TouchableOpacity onPress={() => router.push(`/${link.toLowerCase()}`)}>
        <Text style={styles.linkText}>Go to {city} page</Text>
      </TouchableOpacity>
    </View>
  );
};

const Welcome: React.FC<WelcomeProps> = ({ username }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {username}! 🎉</Text>

      <CityTab
        city="Calgary"
        imageUrl="https://www.toniagara.com/blog/wp-content/uploads/2023/12/Calgary-Skyline-at-Dusk.jpg"
        link="calgary"
      />
      <CityTab
        city="Edmonton"
        imageUrl="https://cityuniversity.ca/wp-content/uploads/2021/01/iStock-1136615456-scaled.jpg"
        link="edmonton"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start', // Align items from the top
    alignItems: 'center',
    backgroundColor: '#f4a261',
    paddingTop: 40, // Add some spacing from the top
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20, // Space between the welcome message and city cards
  },
  cityContainer: {
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: '#3d2c8d',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    width: 300,
  },
  cityText: {
    fontSize: 22,
    fontWeight: '500',
    color: 'white',
    marginBottom: 5,
  },
  cityImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default Welcome;
