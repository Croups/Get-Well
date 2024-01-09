import { Alert, Button, SectionList, Text, TouchableOpacity, View } from "react-native"
import uuid from 'react-native-uuid';
import useUserStore from "../store/UserStore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Modal, TextInput } from "react-native-paper";
import { useCallback, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import useLoadingStore from "../store/LoadingStore";
import { IAppointment, IChat, IDoctor, IPatient, IUser, RootStackParamList } from "../types";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";

const AppointmentModal = ({ isVisible, onDismiss, onAppointment }: { isVisible: boolean, onDismiss: () => void, onAppointment: (desc: string, date: Date) => void }) => {
    const [appointmentDesc, setAppointmentDesc] = useState("");
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [isDateModalVisible, setDateModalVisible] = useState(false);

    return (
        <Modal visible={isVisible} onDismiss={onDismiss} style={{
            marginTop: 0,
            justifyContent: "flex-end",
        }}>
            <View style={{ position: 'absolute', bottom: 0, backgroundColor: "white", height: 230, width: "95%", marginLeft: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingLeft: 10, paddingRight: 10 }}>
                <View>
                    <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>Şikayetiniz</Text>
                    <TextInput
                        style={{ height: 35, marginTop: 10, borderBottomColor: "green", borderBottomWidth: 2 }}
                        placeholder="Şikayetinizden bahsedin."
                        onChangeText={setAppointmentDesc}
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>Tarih</Text>
                    <TextInput
                        style={{ height: 35, marginTop: 10, borderBottomColor: "green", borderBottomWidth: 2 }}
                        value={appointmentDate.toLocaleString()}
                        placeholder="Tarih seçiniz"
                        onPressIn={() => setDateModalVisible(true)}
                    />
                    <DateTimePickerModal
                        mode="datetime"
                        onCancel={() => setDateModalVisible(false)}
                        onConfirm={(date) => {
                            setAppointmentDate(date);
                            setDateModalVisible(false);
                        }}
                        isVisible={isDateModalVisible}
                    />
                </View>
                <TouchableOpacity
                    style={{ marginTop: 20, marginRight: 15, backgroundColor: "green", width: 90, padding: 5, borderRadius: 3, alignSelf: 'flex-end' }}
                    onPress={() => {
                        onAppointment(appointmentDesc, appointmentDate);
                        onDismiss();
                    }}
                >
                    <Text style={{ color: "white" }}>Randevu iste</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};


export default () => {
    const loadingStore = useLoadingStore();
    const userStore = useUserStore();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [chats, setChats] = useState<IChat[]>([]);


    useFocusEffect(useCallback(() => {
        const unsubscribe = firestore().collection<IChat>("chats").onSnapshot((context) => {
            var chats = context.docs.map(x => ({ ID: x.id, ...x.data() }));
            setChats(chats.filter(x => x.Appointment.IsDeleted == false).filter(x=>x.Users.find(y=>y.UID==auth().currentUser?.uid)));
        });

        return () => unsubscribe();
    }, []));

    const appointmentData = [
        {
            title: "Bekleyen Randevularım",
            data: chats.filter(x => x.Appointment.IsDone == false)
        },
        {
            title: "Aktif Randevularım",
            data: chats.filter(x => x.Appointment.IsDone == true)
        }
    ];

    const onView = (id: string) => {
        navigation.navigate("Chat", { ID: id });
    };

    const onDelete = (id: string) => {
        Alert.alert(
            'Uyarı',
            'Are you sure ?',
            [
                {
                    text: 'Yes', onPress: async () => {
                        loadingStore.setLoading(true);
                        await firestore()
                            .collection<IChat>("chats")
                            .doc(id)
                            .delete();
                        loadingStore.setLoading(false);
                    }
                },
                { text: 'Hayır', style: 'cancel' }
            ], { cancelable: false }
        )
    }

    const onAppointment = async (desc: string, date: Date) => {
        loadingStore.setLoading(true);

        const doctorRequest = await firestore().collection<IDoctor>("doctors").get();
        const doctors = doctorRequest.docs.map(x => ({ uid: x.id, ...x.data() }));
        const selectedDoctor = doctors[Math.floor(Math.random() * doctors.length)];

        const doctorUserRequest = await firestore().collection<IUser>("users").doc(selectedDoctor.uid);
        const selectedUser = (await doctorUserRequest.get()).data();

        const currentPatientRequest= await firestore().collection<IPatient>("patients").doc(auth().currentUser?.uid).get();
        const currentPatient= currentPatientRequest.data();

        await firestore().collection<IChat>("chats").add({
            LastUpdated: Date.now(),
            Users: [
                { UID: auth().currentUser?.uid as string, FullName: userStore.user?.FullName, Sex: userStore.user?.Sex as number },
                { UID: selectedDoctor.uid, FullName: selectedUser?.FullName, Sex: selectedUser?.Sex as number }
            ],
            Appointment: {
                Description: desc,
                Date: date.getTime(),
                IsDone: false,
                IsDeleted: false
            },
            Messages: [
                {
                    ID: uuid.v4().toString(),
                    CreatedAt: Date.now(),
                    Text: `Şikayet: ${desc}\nHastalıklar: ${currentPatient?.MedicalCondition}\nİlaçlar: ${currentPatient?.Medications}\nKilo: ${currentPatient?.Weight}\nBoy: ${currentPatient?.Height}\nCinsiyet: ${userStore.user?.Sex==0 ? 'Erkek' : 'Kadın'}`,
                    User: {
                        UID: auth().currentUser?.uid as string,
                        ...userStore.user,
                    }
                }
            ]
        });

        setCreateModalVisible(false);
        loadingStore.setLoading(false);
    };

    return (
        <>
            <View style={{ padding: 30, flex: 1 }}>
                <SectionList
                    sections={appointmentData}
                    keyExtractor={(item, index) => item.ID as string}
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: 'white', marginTop: 10, paddingTop: 10, paddingLeft: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => onView(item.ID as string)}
                                style={{ backgroundColor: 'rgba(52, 52, 52, 0.3)', height: 30, width: 30, marginRight: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center', }}
                            >
                                <Ionicons name="eye" size={27} color={"green"} />
                            </TouchableOpacity>
                            <View style={{ flex: 1, width: "100%" }}>
                                <Text style={{ fontSize: 20 }}>{item.Users.find(x => x.UID != auth().currentUser?.uid)?.FullName}</Text>
                                <Text>{new Date(item.Appointment.Date).toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => onDelete(item.ID as string)}
                                style={{ marginRight: 20, }}
                            >
                                <Ionicons name="trash" size={27} color={"red"} />
                            </TouchableOpacity>
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'green', marginTop: 10 }}>{title}</Text>
                    )}
                />
                {
                    userStore.user?.Type==0 ?
                        (
                            <TouchableOpacity
                                style={{ backgroundColor: "white", position: 'absolute', right: 20, bottom: 20, padding: 8, borderRadius: 50 }}
                                onPress={() => setCreateModalVisible(true)}
                            >
                                <Ionicons name="add-outline" size={27} color={"green"} />
                            </TouchableOpacity>
                        ) : null
                }
            </View>

            <AppointmentModal
                isVisible={isCreateModalVisible}
                onDismiss={() => setCreateModalVisible(false)}
                onAppointment={onAppointment}
            />
        </>
    );
}