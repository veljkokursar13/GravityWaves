import { Dimensions } from 'react-native';

//types for the ship
export type Ship = {
    id: string;
    width: number;
    height: number;
    speed: number;
    direction: number;
    rotation: number;
    x: number;
    y: number;
    startingPosition: { x: number; y: number };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SHIP_WIDTH = 100;
const SHIP_HEIGHT = 100;
const START_X = screenWidth / 2;
const START_Y = screenHeight - SHIP_HEIGHT / 2;

export const initialShip: Ship = {
    id: 'ship',
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    speed: 100,
    direction: 0,
    rotation: 0,
    x: START_X,
    y: START_Y,
    startingPosition: { x: START_X, y: START_Y },
}