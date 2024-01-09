import { Image, Text, TextInput, TouchableOpacity, View } from "react-native"
import auth from '@react-native-firebase/auth'
import useLoadingStore from "../../store/LoadingStore";
import { useState } from "react";
import { showMessage } from "react-native-flash-message";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types";

export default () => {
    const navigation= useNavigation<NavigationProp<RootStackParamList>>();
    const loadingStore = useLoadingStore();
    const [username, setUsername]= useState("");
    const [password, setPassword]= useState("");

    const submit= ()=>{
        if(!username || !password){
            showMessage({
                message: "Please enter your informations !",
                type: 'danger'
            });
            return;
        }

        loadingStore.setLoading(true);
        auth()
            .signInWithEmailAndPassword(username, password)
            .then(x=>{
                showMessage({
                    message: "Successfully logon",
                    type: 'success'
                })
            })
            .catch(err=>{
                showMessage({
                    message: err.message,
                    type: 'danger'
                })
            })
            .finally(()=>{
                loadingStore.setLoading(false);
            })
    }
    return (
        <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Image
                style={{
                    height: 150,
                    width: 150,
                    marginBottom: 50
                }}
                source={require('../../assets/logo.png')}
            />
            <Text style={{
                fontSize: 24,
                color: "green"
            }}>Welcome</Text>

            <TextInput style={{
                width: "55%",
                marginTop: 30,
                borderBottomColor: "green",
                borderBottomWidth: 2
            }}
            placeholder="Username"
            onChangeText={(text: string)=>setUsername(text)}
            />

            <TextInput style={{
                width: "55%",
                marginTop: 30,
                borderBottomColor: "green",
                borderBottomWidth: 2
            }} placeholder="Password"
            secureTextEntry={true}
            onChangeText={(text: string)=>setPassword(text)}/>

            <TouchableOpacity style={{
                marginTop: 30,
                backgroundColor: 'green',
                padding: 8,
                borderRadius: 8,
            }} onPress={submit}>
                <Text
                style={{
                    color: "white",
                    fontSize: 16
                }}
                >Log In</Text>
            </TouchableOpacity>

            <Text
             style={{
                marginTop: 30,
             }}
            >Not register yet ?</Text>

            <TouchableOpacity style={{
                marginTop: 30,
            }}
            onPress={()=>navigation.navigate("Register")}>
                <Text
                style={{
                    color: "green",
                    fontSize: 16
                }}
                >Sign Up</Text>
            </TouchableOpacity>
        </View>
    )
}