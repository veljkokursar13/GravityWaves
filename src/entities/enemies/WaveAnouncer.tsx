//function that announces the next wave
import { Text } from 'react-native';
import { useFonts } from '@/hooks/useFonts';
export function WaveAnouncer({ wave }: { wave: number }) {
    const { fontsLoaded } = useFonts();
    if (!fontsLoaded) return null;
    return (
        <Text style={{ fontFamily: 'Quantico', fontSize: 20, color: 'white' }}>Wave {wave}</Text>
    )
}