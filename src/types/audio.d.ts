type Audio = {
    id: string;
    name: string;
    path: string;
    type: 'music' | 'sfx';
    volume: number;
    loop: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    isStopped: boolean;
    isCompleted: boolean;
    play: () => void;
    pause: () => void;
    stop: () => void;
};