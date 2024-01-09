import LoginScreen from "./screen/Auth/LoginScreen"
import RegisterScreen from "./screen/Auth/RegisterScreen"
import ChatScreen from "./screen/ChatScreen"
import HomeScreen from "./screen/HomeScreen"
import ProfileScreen from "./screen/ProfileScreen"

export const Routes= [
    {
        name: "Home",
        icons: ["home", "home-outline"],
        component: HomeScreen,
        hidden: false
    },
    {
        name: "Chat",
        icons: ["chatbox", "chatbox-outline"],
        component: ChatScreen,
        hidden: true
    },
    {
        name: "Profile",
        icons: ["people", "people-outline"],
        component: ProfileScreen,
        hidden: false
    },
    {
        name: "Sign Out",
        icons: ["log-out", "log-out-outline"],
        component: ProfileScreen,
        hidden: false
    }
]

export const AuthRoutes= [
    {
        name: "Login",
        icons: ["", ""],
        component: LoginScreen
    },
    {
        name: "Register",
        icons: ["", ""],
        component: RegisterScreen
    },
]
