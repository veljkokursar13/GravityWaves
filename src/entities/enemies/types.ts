export type DronePattern = 'straight' | 'zigzag' | 'homing' | 'snake';

export type Drone = {
    id: string;
    width: number;
    height: number;
    speed: number;
    direction: number;
    rotation: number;
    x: number;
    y: number;
    pattern: DronePattern;
    zigzagOffset?: number; // for zigzag pattern
}