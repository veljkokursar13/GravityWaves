//bullet component
import { Image, useImage } from '@shopify/react-native-skia';
import type { SpaceShipProjectile } from './types';

interface BulletProps {
    bullet: SpaceShipProjectile;
}

export default function Bullet({ bullet }: BulletProps) {
    const bulletImage = useImage(require('../../assets/images/bullet.png'));

    if (!bulletImage) return null;

    return (
        <Image
            image={bulletImage}
            x={bullet.x - bullet.width / 2}
            y={bullet.y - bullet.height / 2}
            width={bullet.width}
            height={bullet.height}
        />
    );
}
