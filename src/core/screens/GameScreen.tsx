import { View } from "react-native";
import PauseScreen from "@/core/overlays/PauseScreen";
import { useStore } from "@/store/store";
import PauseButton from "@/ui/PauseButton";
import GameEngine from "@/core/GameEngine";

export default function GameScreen() {
    const { appState, setAppState } = useStore();
    const paused = appState === 'paused';
    return (
        <View style={{ flex: 1 }}>
            <GameEngine />
            <View style={{ position: 'absolute', top: 50, right: 65, zIndex: 10 }}>
                <PauseButton
                  isPaused={paused}
                  onPress={() => { setAppState(paused ? 'game' : 'paused'); }}
                />
            </View>
            {paused && <PauseScreen />}
        </View>
    )
}


