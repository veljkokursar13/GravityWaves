// Projectile types

export type SpaceShipProjectile = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: number;
    rotation: number;
    damage: number;
    type: 'spaceShipProjectile';
    time: number;
};

export type EnemyProjectile = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: number;
    rotation: number;
    damage: number;
    type: 'enemyProjectile';
    time: number;
};