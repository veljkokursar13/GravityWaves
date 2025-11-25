import { useEffect } from "react";
import { useStore } from "@/store/store";

/**
 * Hook that activates double shot when score exceeds 600
 * Updates the store's booster.doubleShot state
 */
export function useShootBooster() {
    const score = useStore((state) => state.score);
    const doubleShot = useStore((state) => state.booster.doubleShot);
    
    useEffect(() => {
        if (score > 600 && !doubleShot) {
            // Activate double shot booster in store
            useStore.setState((state) => ({
                booster: { ...state.booster, doubleShot: true }
            }));
        }
    }, [score, doubleShot]);
    
    return doubleShot;
}
