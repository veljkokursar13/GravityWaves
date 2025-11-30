//app state listener

import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useStore } from '@/store/store';

export function AppStateHandler() {
    const {appState, setAppState} = useStore();

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState: string) => {
            if(nextState.match(/inactive|background/)){
                setAppState('paused');
            }else if(nextState.match(/active/)){
                setAppState('game');
            }
        });
        return () => sub.remove();
    }, [appState, setAppState]);
    
    return null; // Listener component - no UI
}

export default AppStateHandler;