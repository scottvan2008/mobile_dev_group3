import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import VDestinations from '../constants/list_item';

const Lab4: React.FC = () => {
    const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);

    const toggleDestination = (id: number) => {
        setSelectedDestinations((prevSelected) => {
            // Check if the destination is already selected
            const isAlreadySelected = prevSelected.includes(id);
    
            if (isAlreadySelected) {
                // If the destination is already selected, remove it from the list
                return prevSelected.filter((item) => item !== id);
            } else {
                // If it's not selected, add it to the list
                return [...prevSelected, id];
            }
        });
    };
    

    return (
      <View style={styles.container}>
      <Text style={styles.title}>Vacation Destinations</Text>
      {VDestinations.map((destination) => (
        <TouchableOpacity
          key={destination.id}
          style={[
            styles.item,
            selectedDestinations.includes(destination.id) && styles.selectedItem,
          ]}
          onPress={() => toggleDestination(destination.id)}
        >
          <Text style={styles.text}>
            {destination.location} - ${destination.price}{" "}
            {selectedDestinations.includes(destination.id) && "\u2705"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedItem: {
    backgroundColor: "#d4edda",
  },
  text: {
    fontSize: 16,
  },
});

export default Lab4;