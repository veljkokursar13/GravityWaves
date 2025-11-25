// Ship lives management - 3 lives with damage system using centralized store
import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/store';

const INVINCIBILITY_DURATION = 2; // seconds of invincibility after hit

export const useShipLives = () => {
    const lives = useStore((state) => state.lives);
    const loseLife = useStore((state) => state.loseLife);
    const [isInvincible, setIsInvincible] = useState(false);
    const invincibilityTimer = useRef<NodeJS.Timeout | null>(null);
    
    // Damage ship (called when collision detected)
    const takeDamage = useCallback(() => {
        if (isInvincible || lives <= 0) return false; // Already invincible or dead
        
        loseLife();
        setIsInvincible(true);
        
        // Clear any existing timer
        if (invincibilityTimer.current) {
            clearTimeout(invincibilityTimer.current);
        }
        
        // Set invincibility period
        invincibilityTimer.current = setTimeout(() => {
            setIsInvincible(false);
            invincibilityTimer.current = null;
        }, INVINCIBILITY_DURATION * 1000);
        
        return true; // Damage was applied
    }, [isInvincible, lives, loseLife]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (invincibilityTimer.current) {
                clearTimeout(invincibilityTimer.current);
            }
        };
    }, []);
    
    return { 
        lives, 
        isInvincible, 
        takeDamage,
        isDead: lives <= 0 
    };
}
