import { Text } from 'react-native';
import { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
  style?: any; // Using any to avoid React Native type complexity
  speed?: number; // ms per character
  delay?: number; // ms delay before starting
}

export default function TypingEffect({ text, style, speed = 100, delay = 0 }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setStarted(false);
  }, [text]);

  // Handle initial delay
  useEffect(() => {
    if (delay === 0) {
      setStarted(true);
      return;
    }

    const delayTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay]);

  // Type out character by character
  useEffect(() => {
    if (!started || currentIndex >= text.length) {
      return; // Not started yet or typing complete
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [started, currentIndex, text, speed]);

  return <Text style={style}>{displayedText}</Text>;
}
