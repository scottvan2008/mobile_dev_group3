import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';


const Sign_in = () => { 
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");


    const handleLogin = () => {alert(`Username: ${username}, Password: ${password}`)};
    return(
    <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} />
        <Button title="Login" onPress={handleLogin} />
    </View>
    )
};

    
export default Sign_in; 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      height: 40,
      margin: 5,
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      width: 200,
    },
  
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
  });