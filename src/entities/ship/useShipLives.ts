// Ship lives management - 3 lives with damage system
import { useState, useRef, useEffect, useCallback } from 'react';

const MAX_LIVES = 3;
const INVINCIBILITY_DURATION = 2; // seconds of invincibility after hit

export const useShipLives = () => {
    const [lives, setLives] = useState(MAX_LIVES);
    const [isInvincible, setIsInvincible] = useState(false);
    const invincibilityTimer = useRef<NodeJS.Timeout | null>(null);
    
    // Damage ship (called when collision detected)
    const takeDamage = useCallback(() => {
        if (isInvincible || lives <= 0) return false; // Already invincible or dead
        
        setLives(prev => Math.max(0, prev - 1));
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
    }, [isInvincible, lives]);
    
    // Reset lives (for new game)
    const resetLives = useCallback(() => {
        setLives(MAX_LIVES);
        setIsInvincible(false);
        if (invincibilityTimer.current) {
            clearTimeout(invincibilityTimer.current);
            invincibilityTimer.current = null;
        }
    }, []);
    
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
        resetLives,
        isDead: lives <= 0 
    };
}
