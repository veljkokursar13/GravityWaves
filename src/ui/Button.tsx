import { Pressable } from "react-native";
import { Text as RNText } from 'react-native';
import { StyleSheet } from 'react-native';
//Button is a component that creates a button
export const Button = ({ children, onPress }: { children: React.ReactNode, onPress: () => void }) => {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            <RNText style={styles.text}>{children}</RNText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});