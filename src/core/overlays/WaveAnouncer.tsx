//this overlay is used to announce the start of a new wave with a text and a countdown and minimal explanation of the wave
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '@/store/store';
import { useEffect, useState } from 'react';

export default function WaveAnouncer() {
    const { currentWave } = useStore();
    const [countdown, setCountdown] = useState(3);
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown]);
    return (
        <View style={WaveAnouncerLocalStyles.container}>
            <Text style={WaveAnouncerLocalStyles.title}>Wave {currentWave}</Text>
            <Text style={WaveAnouncerLocalStyles.countdown}>{countdown}</Text>
        </View>
    );
}

const WaveAnouncerLocalStyles = StyleSheet.create({
    container: {
        position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        title: {
            fontSize: 24,
            color: '#fff',
        },
    countdow: {
        fontSize: 24,
        color: '#fff',
    },
});