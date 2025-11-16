//Hud shows score and wave
import { View, Text, StyleSheet } from 'react-native';
import { useScore } from '@/hooks/useScore';
import { useStore } from '@/store/store';
import { useFonts } from '@/hooks/useFonts';

export default function Hud() {
    const { score } = useScore();
    const { currentWave } = useStore();
    const { fontsLoaded } = useFonts();
    if (!fontsLoaded) return null;
    return (
        <View pointerEvents="none" style={styles.hud}>
            <Text style={styles.score}>Score: {score}</Text>
            <Text style={styles.wave}>Wave: {currentWave}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    hud: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    score: {
        fontSize: 18,
        color: '#fff',
    },
    wave: {
        fontSize: 18,
        color: '#fff',
        marginTop: 4,
    },
});