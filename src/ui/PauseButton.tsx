import React from 'react';
import { Pressable } from 'react-native';
import { Pause, Play } from 'lucide-react-native';

interface PauseButtonProps {
  onPress: () => void;
  isPaused?: boolean;
}

export default function PauseButton({ onPress, isPaused = false }: PauseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
      hitSlop={8}
    >
      {isPaused ? (
        <Play color="#ffffff" size={30} />
      ) : (
        <Pause color="#ffffff" size={30} />
      )}
    </Pressable>
  );
}
 
