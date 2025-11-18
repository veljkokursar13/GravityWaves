//Hud shows score and wave
import { View, Text, StyleSheet } from 'react-native';
import { useScore } from '@/hooks/useScore';
import { useFonts } from '@/hooks/useFonts';

type Props = { waveId: number };

export default function Hud({ waveId }: Props) {
    const { score } = useScore();
    const { fontsLoaded } = useFonts();
    if (!fontsLoaded) return null;
    return (
        <View pointerEvents="none" style={styles.hud}>
            <View style={styles.pill}>
                <Text style={styles.line}>Score: {score}</Text>
                <Text style={styles.line}>Wave: {waveId}</Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    hud: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.35)',
        // subtle shadow
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    line: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'OrbitronBold',
    },
});
