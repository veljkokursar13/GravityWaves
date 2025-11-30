import { View, StyleSheet } from "react-native";
import PauseScreen from "@/core/overlays/PauseScreen";
import { useStore } from "@/store/store";
import PauseButton from "@/ui/PauseButton";
import GameEngine from "@/core/GameEngine";

export default function GameScreen() {
    const { appState, setAppState } = useStore();
    const paused = appState === 'paused';
    const isGameOver = appState === 'gameover';
    
    return (
        <View style={{ flex: 1 }}>
            <GameEngine />
            {/* Hide pause button on game over */}
            {!isGameOver && (
                <View style={styles.pauseButtonContainer}>
                    <PauseButton
                      isPaused={paused}
                      onPress={() => { setAppState(paused ? 'game' : 'paused'); }}
                      size={30}
                    />
                </View>
            )}
            {paused && <PauseScreen />}
        </View>
    )
}

const styles = StyleSheet.create({
    pauseButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 70, // Position to the right of audio icon (20px icon + 30px gap + 20px right margin)
        zIndex: 10,
    },
});


