import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

interface AuthSectionProps {
  isSignedIn: boolean
  username: string
  onSignOut: () => void
  onNavigateToLocations: () => void
  onNavigateToSignIn: () => void
  onNavigateToSignUp: () => void
}

export function AuthSection({
  isSignedIn,
  username,
  onSignOut,
  onNavigateToLocations,
  onNavigateToSignIn,
  onNavigateToSignUp,
}: AuthSectionProps) {
  return (
    <View style={styles.authContainer}>
      {isSignedIn ? (
        <>
          <Text style={styles.authTitle}>Welcome, {username}</Text>
          <TouchableOpacity style={styles.myLocationsButton} onPress={onNavigateToLocations}>
            <Icon name="map-marker-multiple" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>My Locations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Icon name="logout" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.authTitle}>Sign in to save locations</Text>
          <TouchableOpacity style={styles.signInButton} onPress={onNavigateToSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton} onPress={onNavigateToSignUp}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  authContainer: {
    marginTop: 30,
    marginHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  authTitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  myLocationsButton: {
    backgroundColor: "#4FC3F7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  signOutButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  signInButton: {
    backgroundColor: "#4FC3F7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
})

