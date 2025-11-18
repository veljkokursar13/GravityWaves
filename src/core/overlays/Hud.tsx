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
        bottom: 12,
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: 'transparent',
        borderWidth: 0.3,
        borderColor: '#fff',
    },
    line: {
        fontSize: 20,
        color: '#fff',
        fontFamily: 'OrbitronBold',
    },
});
