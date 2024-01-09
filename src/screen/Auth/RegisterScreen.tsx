import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore';
import useLoadingStore from "../../store/LoadingStore";
import React, { useState } from "react";
import { showMessage } from "react-native-flash-message";
import { RadioButton } from 'react-native-paper';
import { IDoctor, IPatient, IUser } from "../../types";
import useUserStore from "../../store/UserStore";
import DateTimePickerModal from "react-native-modal-datetime-picker";


export default () => {
    const loadingStore = useLoadingStore();
    const userStore = useUserStore();

    const [isDateModalVisible, setDateModalVisible] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState<Number>(0);

    const [fullName, setFullName] = useState("");
    const [birthDay, setBirthDay] = useState<Date>();
    const [sex, setSex] = useState(0);


    const submit = () => {
        if (!username || !password || !fullName || !birthDay) {
            showMessage({
                message: "Please enter your informations !",
                type: 'danger'
            });
            return;
        }

        loadingStore.setLoading(true);
        auth()
            .createUserWithEmailAndPassword(username, password)
            .then(async x => {

                showMessage({
                    message: "Successfully registered.",
                    type: 'success'
                });

                const user = {
                    FullName: fullName,
                    Age: birthDay.getTime().toString(),
                    Type: userType,
                    Sex: sex
                } as IUser;
                userStore.setUser(user)

                await firestore().collection("users").doc(auth().currentUser?.uid).set(user)

                if (userType == 0) {
                    await firestore().collection("patients").doc(auth().currentUser?.uid).set({
                        Height: 0,
                        Weight: 0,
                        MedicalCondition: "",
                        Medications: "",
                        Sex: 0
                    } as IPatient)
                } else if (userType == 1) {
                    await firestore().collection("doctors").doc(auth().currentUser?.uid).set({
                        Profession: ""
                    } as IDoctor)
                }

            })
            .catch(err => {
                showMessage({
                    message: err.message,
                    type: 'danger'
                })
            })
            .finally(() => {
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
                    height: 100,
                    width: 100,
                    marginTop: 20,
                    marginBottom: 50
                }}
                source={require('../../assets/logo.png')}
            />
            <Text style={{
                fontSize: 24,
                color: "green"
            }}>Welcome</Text>
            <ScrollView
            style={{
                width: "55%",
            }}>
                <TextInput style={{
                    width: "100%",
                    marginTop: 30,
                    borderBottomColor: "green",
                    borderBottomWidth: 2
                }}
                    placeholder="Username"
                    onChangeText={(text: string) => setUsername(text)}
                />

                <TextInput style={{
                    width: "100%",
                    marginTop: 30,
                    borderBottomColor: "green",
                    borderBottomWidth: 2
                }} placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(text: string) => setPassword(text)} />
                <View
                    style={{
                        marginTop: 30,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <RadioButton
                            value="first"
                            status={userType === 0 ? 'checked' : 'unchecked'}
                            onPress={() => setUserType(0)}
                        />
                        <Text style={{
                            marginTop: 5
                        }}>Patient</Text>
                    </View>

                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <RadioButton
                            value="first"
                            status={userType === 1 ? 'checked' : 'unchecked'}
                            onPress={() => setUserType(1)}
                        />
                        <Text style={{
                            marginTop: 5
                        }}>Doctor</Text>
                    </View>
                </View>

                <TextInput style={{
                    width: "100%",
                    marginTop: 30,
                    borderBottomColor: "green",
                    borderBottomWidth: 2
                }} placeholder="Fullname"
                    onChangeText={(text: string) => setFullName(text)} />

                <TextInput style={{
                    width: "100%",
                    marginTop: 30,
                    borderBottomColor: "green",
                    borderBottomWidth: 2
                }}
                    placeholder="BirthDay"
                    onPressIn={() => setDateModalVisible(true)}
                    value={birthDay?.toLocaleDateString()} />

                <DateTimePickerModal
                    mode="date"
                    onCancel={() => setDateModalVisible(false)}
                    onConfirm={(date: Date) => {
                        setBirthDay(date);
                        setDateModalVisible(false);
                    }}
                    isVisible={isDateModalVisible}
                />

                <View
                    style={{
                        marginTop: 30,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <RadioButton
                            value="first"
                            status={sex === 0 ? 'checked' : 'unchecked'}
                            onPress={() => setSex(0)}
                        />
                        <Text style={{
                            marginTop: 5
                        }}>Male</Text>
                    </View>

                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <RadioButton
                            value="first"
                            status={sex === 1 ? 'checked' : 'unchecked'}
                            onPress={() => setSex(1)}
                        />
                        <Text style={{
                            marginTop: 5
                        }}>Female</Text>
                    </View>
                </View>


                <TouchableOpacity style={{
                    marginTop: 30,
                    backgroundColor: 'green',
                    padding: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={submit}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 16
                        }}
                    >Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}