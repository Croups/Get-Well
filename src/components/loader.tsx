import LottieView from "lottie-react-native";
import { View } from "react-native";

export default (props: {isShowing: boolean}) => {
    return (
        <View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            display: props.isShowing ? 'flex' : 'none'
        }}>
            <LottieView
                source={require("../assets/loading.json")}
                autoPlay
                loop
                style={{ width: 400, height: 400 }}
            />
        </View>
    )
}