// Centered banner to announce wave start; visible during between-wave phase
import { View, Text, StyleSheet } from 'react-native';

export default function WaveAnouncer({ waveId }: Readonly<{ waveId: number }>) {
  return (
    <View pointerEvents="none" style={WaveAnouncerLocalStyles.container}>
      <Text style={WaveAnouncerLocalStyles.title}>Wave {waveId}</Text>
      <Text style={WaveAnouncerLocalStyles.subtitle}>Get Ready</Text>
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
		zIndex: 1000,
	},
	title: {
		fontSize: 28,
		color: '#fff',
		marginBottom: 6,
		fontWeight: '700',
	},
	subtitle: {
		fontSize: 16,
		color: '#fff',
		opacity: 0.9,
	},
});