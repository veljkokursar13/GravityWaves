//preload images hook
import { useState, useEffect } from 'react';
import { Image } from 'react-native';

const usePreloadImages = (sources: any[]) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadImages = async () => {
            await Promise.all(sources.map(src => Image.prefetch(src).catch(() => {})));
            setLoaded(true);
        };
        void loadImages();
    }, [sources]);

    return loaded;
};
export default usePreloadImages;