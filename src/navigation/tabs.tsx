
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Routes } from '../const'
import { Text, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth'
const Tab = createBottomTabNavigator();

export default () => {

  const onLogOut= async()=>{
    await auth().signOut();
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const currentRoute = Routes.find(x => x.name === route.name);
          const currentIcon = currentRoute?.icons[focused ? 0 : 1];

          return <Ionicons name={currentIcon as string} size={size} color={color} />;
        },
      })}
    >
      {Routes.map(myRoute => (
        <Tab.Screen
          key={myRoute.name} // Anahtar olarak rota adını kullan
          name={myRoute.name}
          component={myRoute.component}
          options={{
            tabBarButton: myRoute.hidden == true && myRoute.name != "Sign Out" ? () => null : myRoute.name == "Sign Out" ? () => (
              <TouchableOpacity style={{
                flexDirection: 'column',
                marginRight: 30,
                marginTop: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={onLogOut}
              >
                <Text>
                  <Ionicons name={myRoute.icons[0]} size={25} />
                </Text>
                <Text style={{
                  fontSize: 12
                }}>
                  Log Out
                </Text>
              </TouchableOpacity>
            ) : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}