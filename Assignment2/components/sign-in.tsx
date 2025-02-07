import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import credentials from '../credentials.json';

type Sign_inProps = {setIsSignedIn: (isSignedIn: boolean) => void};

const Sign_in: React.FC<Sign_inProps> = ({setIsSignedIn, username, setUsername }) => { 
    // const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = () => {
        const user = credentials.users.find((user) => user.username === username
        && user.password === password);
        if (user) {
            setIsSignedIn(true);
        } else {
            alert("Login failed");
        }
    }


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