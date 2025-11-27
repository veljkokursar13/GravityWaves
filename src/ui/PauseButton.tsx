import React from 'react';
import { Pressable } from 'react-native';
import { Pause, Play } from 'lucide-react-native';

interface PauseButtonProps {
  onPress: () => void;
  isPaused?: boolean;
  size?: number;
}

export default function PauseButton({ onPress, isPaused = false, size = 30 }: PauseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
      hitSlop={8}
    >
      {isPaused ? (
        <Play color="#ffffff" size={size} textShadowColor='rgba(0, 220, 255, 0.5)' textShadowOffset={{ width: 0, height: 0 }} textShadowRadius={10}   />
      ) : (
        <Pause color="#ffffff" size={size} textShadowColor='rgba(0, 220, 255, 0.5)' textShadowOffset={{ width: 0, height: 0 }} textShadowRadius={10} />
      )}
    </Pressable>
  );
}
 
