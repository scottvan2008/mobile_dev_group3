import { View, Text, StyleSheet } from "react-native";
import DateFactFetcher from '../components/DataFactFetcher'; 


export default function ApiPage() {
   
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date Fact</Text>
      <DateFactFetcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
