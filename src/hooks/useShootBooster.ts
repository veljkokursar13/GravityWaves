import { useEffect, useState } from "react";
import { useStore } from "@/store/store";

/**
 * Hook that activates double shot when score exceeds 600
 * Returns boolean indicating if double shot is active
 */
export function useShootBooster() {
    const score = useStore((state) => state.score);
    const [shootBooster, setShootBooster] = useState(false);
    
    useEffect(() => {
        if (score > 600) {
            setShootBooster(true);
        }
    }, [score]);
    
    return shootBooster;
}
