import { Pressable, View } from "react-native";
import { Pause} from "lucide-react-native";
import { useStore } from "@/store/store";
import { useEffect } from "react";

export default function GameScreen() {
    const { appState, setAppState } = useStore();
    useEffect(() => {
        setAppState('paused');
    }, []);
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={() => {setAppState('paused');}}><Pause color="white" size={24} /></Pressable>
            </View>
        )
}