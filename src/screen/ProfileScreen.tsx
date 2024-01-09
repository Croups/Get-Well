import { useCallback, useEffect, useState } from "react"
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import auth from '@react-native-firebase/auth'
import { useFocusEffect } from "@react-navigation/native";
import useLoadingStore from "../store/LoadingStore";
import useUserStore from "../store/UserStore";
import firestore from '@react-native-firebase/firestore'
import { IDoctor, IPatient, IUser } from "../types";
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, RadioButton } from "react-native-paper";

export default () => {
    const loadingStore = useLoadingStore();
    const userStore = useUserStore();

    const [currentFUser, setCurrentFUser] = useState(auth().currentUser);
    const [currentUser, setCurrentUser] = useState(userStore.user);
    const [currentPatient, setCurrentPatient] = useState<IPatient>();
    const [currentDoctor, setCurrentDoctor] = useState<IDoctor>();

    const updatePatient = useCallback((updatedFields: any) => {
        setCurrentPatient(prev => ({ ...prev, ...updatedFields }));
    }, []);

    const updateDoctor = useCallback((updatedFields: IDoctor) => {
        setCurrentDoctor(prev => ({ ...prev, ...updatedFields }));
    }, []);

    const updateUser = useCallback((updatedFields: any) => {
        setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }, []);

    const collectionType = () => currentUser?.Type === 0 ? "patients" : "doctors";



    const fetchData = async () => {
        loadingStore.setLoading(true);
        try {
            const response = await firestore().collection(collectionType()).doc(currentFUser?.uid).get();
            currentUser?.Type === 0 ? setCurrentPatient(response.data() as IPatient) : setCurrentDoctor(response.data() as IDoctor);
        } catch (error) {
            console.error('Veri çekerken hata oluştu:', error);
        } finally {
            loadingStore.setLoading(false);
        }
    };


    useFocusEffect(useCallback(() => {
        fetchData();
    }, []));



    const submit = async () => {
        loadingStore.setLoading(true);
        try {
            await firestore()
                .collection(collectionType())
                .doc(currentFUser?.uid)
                .set(currentUser?.Type === 0 ? currentPatient as IPatient : currentDoctor as IDoctor);

            await firestore().collection<IUser>("users").doc(currentFUser?.uid).set(currentUser as IUser);
        } catch (error) {
            console.error('Kaydetme sırasında hata oluştu:', error);
        } finally {
            loadingStore.setLoading(false);
        }
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
                    marginBottom: 50
                }}
                source={require('../assets/logo.png')}
            />
            <ScrollView>
                {
                    currentUser?.Type == 0 ? (
                        <>
                            <View>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Full Name
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentUser.FullName}
                                    onChangeText={(text: string) => updateUser({ FullName: text })}
                                />
                            </View>

                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Height
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentPatient?.Height.toString()}
                                    onChangeText={(text: string) => updatePatient({ Height: Number(text) })}
                                />
                            </View>

                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Weight
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentPatient?.Weight.toString()}
                                    onChangeText={(text: string) => updatePatient({ Weight: Number(text) })}
                                />
                            </View>

                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Sex
                                </Text>
                                <View
                                    style={{
                                        marginTop: 10,
                                        flexDirection: 'row',

                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <View style={{
                                        flexDirection: 'row'
                                    }}>
                                        <RadioButton
                                            value="first"
                                            status={currentUser?.Sex === 0 ? 'checked' : 'unchecked'}
                                            onPress={() => updateUser({ Sex: 0 })}
                                        />
                                        <Text style={{
                                            marginTop: 5
                                        }}>Erkek</Text>
                                    </View>

                                    <View style={{
                                        flexDirection: 'row'
                                    }}>
                                        <RadioButton
                                            value="first"
                                            status={currentUser?.Sex === 1 ? 'checked' : 'unchecked'}
                                            onPress={() => updateUser({ Sex: 1 })}
                                        />
                                        <Text style={{
                                            marginTop: 5
                                        }}>Kadın</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    MedicalCondition
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentPatient?.MedicalCondition as string}
                                    onChangeText={(text: string) => updatePatient({ MedicalCondition: text })}
                                />
                            </View>
                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Medications
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentPatient?.Medications as string}
                                    onChangeText={(text: string) => updatePatient({ Medications: text })}
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{
                                marginTop: 20,
                            }}>
                                <Text style={{
                                    marginLeft: 10
                                }}>
                                    Profession
                                </Text>
                                <TextInput style={{
                                    borderBottomColor: "green",
                                    borderBottomWidth: 2
                                }}
                                    value={currentDoctor?.Profession as string}
                                    onChangeText={(text: string) => updateDoctor({ Profession: text })}
                                />
                            </View>
                        </>
                    )
                }




                <TouchableOpacity style={{
                    marginTop: 30,
                    backgroundColor: 'green',
                    padding: 8,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center'
                }} onPress={submit}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 16
                        }}
                    >Kaydet</Text>
                </TouchableOpacity>
            </ScrollView>

        </View>
    )
}