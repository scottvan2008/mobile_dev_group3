// import React, { useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// // import SignIn from '../components/sign-in'; // Ensure consistent naming convention
// // import Welcome from './tabs/welcome';



// // export default function App() {
// //   // State to track user authentication status
// //   const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
// //   // State to store the username
// //   const [username, setUsername] = useState<string>("");

// //   return (
// //     <View style={styles.container}>
// //       {/* Show Welcome page if signed in, otherwise show SignIn */}
// //       {isSignedIn ? (
// //         <Welcome username={username} />
// //       ) : (
// //         <SignIn setIsSignedIn={setIsSignedIn} username={username} setUsername={setUsername} />
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#ffffff', // Explicit color naming for readability
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Date Facts</Text>
      <Button title="Get Date Facts" onPress={() => router.push("/api")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
