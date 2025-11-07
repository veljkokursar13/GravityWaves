//PauseScreen is a component that displays the pause screen
import { View } from 'react-native';

let BlurComponent: any = View;
let hasBlur = false;
try {
    // Prefer expo-blur when available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    BlurComponent = require('expo-blur').BlurView;
    hasBlur = true;
} catch {
    hasBlur = false;
}

export default function PauseScreen() {
    const overlayStyle = {
        position: 'absolute' as const,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };
    return hasBlur ? (
        <BlurComponent intensity={50} tint="dark" style={overlayStyle} />
    ) : (
        <View style={{ ...overlayStyle, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
    );
}