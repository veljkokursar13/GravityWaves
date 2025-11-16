//collision detection system
import { Ship } from '@/entities/ship/types';
import { Drone } from '@/entities/enemies/types';
import { SpaceShipProjectile } from '@/entities/projectiles/types';

export type Collision = {
    ship: Ship;
    drone: Drone;
}

export type BulletDroneCollision = {
    bullet: SpaceShipProjectile;
    drone: Drone;
}

// AABB collision detection (assumes x/y are center points)
export function detectCollisions(ship: Ship | null, drones: Drone[]): Collision[] {
    if (!ship || !drones.length) return [];
    
    const collisions: Collision[] = [];
    
    for (const drone of drones) {
        // Calculate bounding boxes from center points
        const shipLeft = ship.x - ship.width / 2;
        const shipRight = ship.x + ship.width / 2;
        const shipTop = ship.y - ship.height / 2;
        const shipBottom = ship.y + ship.height / 2;
        
        const droneLeft = drone.x - drone.width / 2;
        const droneRight = drone.x + drone.width / 2;
        const droneTop = drone.y - drone.height / 2;
        const droneBottom = drone.y + drone.height / 2;
        
        // Check AABB overlap
        if (
            shipRight > droneLeft &&
            shipLeft < droneRight &&
            shipBottom > droneTop &&
            shipTop < droneBottom
        ) {
            collisions.push({ ship, drone });
        }
    }
    
    return collisions;
}

// Detect collisions between bullets and drones
export function detectBulletDroneCollisions(
    bullets: SpaceShipProjectile[],
    drones: Drone[]
): BulletDroneCollision[] {
    if (!bullets.length || !drones.length) return [];
    
    const collisions: BulletDroneCollision[] = [];
    
    for (const bullet of bullets) {
        for (const drone of drones) {
            // Calculate bounding boxes from center points
            const bulletLeft = bullet.x - bullet.width / 2;
            const bulletRight = bullet.x + bullet.width / 2;
            const bulletTop = bullet.y - bullet.height / 2;
            const bulletBottom = bullet.y + bullet.height / 2;
            
            const droneLeft = drone.x - drone.width / 2;
            const droneRight = drone.x + drone.width / 2;
            const droneTop = drone.y - drone.height / 2;
            const droneBottom = drone.y + drone.height / 2;
            
            // Check AABB overlap
            if (
                bulletRight > droneLeft &&
                bulletLeft < droneRight &&
                bulletBottom > droneTop &&
                bulletTop < droneBottom
            ) {
                collisions.push({ bullet, drone });
            }
        }
    }
    
    return collisions;
}

// Utility: Check if ship is colliding with any drone
export function isShipColliding(ship: Ship, drones: Drone[]): boolean {
    return detectCollisions(ship, drones).length > 0;
}
