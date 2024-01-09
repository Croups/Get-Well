import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import FlashMessage from "react-native-flash-message";
import firestore from '@react-native-firebase/firestore';

import Loader from './src/components/loader';

import { AuthRoutes } from './src/const';
import tabs from './src/navigation/tabs'
import useLoadingStore from './src/store/LoadingStore';
import { IUser, RootStackParamList } from './src/types';
import useUserStore from './src/store/UserStore';



const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const [currentUser, setCurrentUser]= useState<FirebaseAuthTypes.User | null>();

  const loadingStore= useLoadingStore();
  const userStore= useUserStore();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if(user){
        var cUser= await firestore().collection<IUser>("users").doc(user.uid).get();
        const userData = cUser.data();
        userStore.setUser(userData);
      }
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {
          currentUser ? (
            <>
              <Stack.Screen options={{ headerShown: false }} name="Tabs" component={tabs} />
            </>
          ) :
            (
              <>
                {AuthRoutes.map(route => (
                  <Stack.Screen name={route.name as any} component={route.component} key={route.name}/>
                ))}
              </>
            )
        }

      </Stack.Navigator>
      <Loader isShowing={loadingStore.isLoading}/>
      <FlashMessage/>
    </NavigationContainer>
  );
}


export default App;
