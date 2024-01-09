import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View, TextInput, StyleSheet } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import { NavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { IAppointment, IChat, IChatItem, IPatient, IUser, RootStackParamList } from "../types";
import useLoadingStore from "../store/LoadingStore";
import useUserStore from "../store/UserStore";

const ListItem = memo(({ isPatient, item }: { isPatient: boolean, item: IChatItem }) => {
    const patientImages = {
        male: require('../assets/patient-male.png'),
        female: require('../assets/patient-female.png'),
    };

    return (
        <View style={{
            flexDirection: 'row',
            padding: 5,
            marginTop: 8,
            position: 'relative',
            overflow: 'scroll',
        }}>
            {isPatient && (
                <Image
                    source={item.User?.Sex == 1 ? patientImages.female : patientImages.male}
                    style={{
                        height: 50,
                        width: 50,
                        marginRight: 10
                    }}
                />
            )}
            <View style={{
                flex: 1,
                alignItems: isPatient ? 'flex-start' : 'flex-end',
            }}>
                <Text style={{
                    fontSize: 16
                }}>{item.User.FullName}</Text>
                <Text style={{
                    fontSize: 13,
                    marginTop: 5
                }}>{item.Text}</Text>
            </View>
            {!isPatient && (
                <Image
                    source={require('../assets/doctor.png')}
                    style={{
                        height: 50,
                        width: 50,
                        marginLeft: 10
                    }}
                />
            )}
        </View>
    );
});


type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default () => {
    const route = useRoute<ChatScreenRouteProp>();

    const [currentChat, setCurrentChat] = useState<IChat>();
    const [currentText, setCurrentText] = useState("");

    const userStore = useUserStore();
    const loadingStore = useLoadingStore();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const sendMessage = async (message: string) => {
        loadingStore.setLoading(true);

        const newMsgs = [
            ...(currentChat?.Messages || []),
            {
                ID: uuid.v4().toString(),
                Text: message,
                CreatedAt: Date.now(),
                User: {
                    UID: auth().currentUser?.uid,
                    ...userStore.user
                } as IUser
            }
        ];

        await firestore().collection<IChat>("chats").doc(route.params?.ID).update({ Messages: newMsgs });
        setCurrentText("");
        loadingStore.setLoading(false);
    };

    useFocusEffect(useCallback(() => {
        const unsubscribe = firestore().collection<IChat>("chats").doc(route.params?.ID).onSnapshot((context) => {
            setCurrentChat(context.data())
        });

        return () => unsubscribe();
    }, [route.params?.ID]));

    const renderItem = useCallback(({ item }: { item: IChatItem }) => {
        return <ListItem item={item} isPatient={item.User.Type == 0} />;
    }, []);

    const onDone = async () => {
        loadingStore.setLoading(true);
        await firestore()
            .collection<IChat>("chats")
            .doc(route.params?.ID)
            .update({ Appointment: { ...currentChat?.Appointment as IAppointment, IsDone: true } });
        loadingStore.setLoading(false);
        navigation.navigate("Home");
        await sendMessage("Randevunuz başarıyla oluşturulmuştur !");
    }

    return (
        <View style={{
            padding: 30,
            flex: 1
        }}>
            {currentChat && (
                <>
                    <Text style={{
                        fontSize: 18,
                        color: 'green',
                    }}>{new Date(currentChat?.Appointment.Date).toLocaleString()} / Randevu</Text>

                    <FlatList
                        data={currentChat.Messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.ID}
                        style={{
                            marginTop: 20,
                            flex: 1,
                        }}
                    />
                    {
                        !currentChat.Appointment.IsDone ? (
                            <View style={{
                                backgroundColor: 'white',
                                padding: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <TextInput
                                    style={{
                                        width: '85%',
                                    }}
                                    onChangeText={setCurrentText}
                                    value={currentText}
                                />
                                <TouchableOpacity onPress={()=>sendMessage(currentText)} style={{
                                    marginLeft: 20,
                                }}>
                                    <Ionicons name="send" size={27} />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    {
                        userStore.user?.Type == 1 && !currentChat.Appointment.IsDone ? (
                            <TouchableOpacity
                                style={{ backgroundColor: "white", position: 'absolute', right: 20, bottom: 120, padding: 8, borderRadius: 50 }}
                                onPress={onDone}
                            >
                                <Ionicons name="checkmark-outline" size={27} color={"green"} />
                            </TouchableOpacity>
                        ) : null
                    }
                </>
            )}
        </View>
    );
}
