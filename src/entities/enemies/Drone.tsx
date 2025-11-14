import { Image } from "@shopify/react-native-skia";
import { useImage } from "@shopify/react-native-skia";
import type { Drone as DroneType } from "./types";

interface DroneProps {
    drone: DroneType;
}

export default function Drone({ drone }: DroneProps) {
    const droneImage = useImage(require("@/assets/images/Drone.png"));

    if (!droneImage) return null;

    return (
        <Image
            image={droneImage}
            x={drone.x - drone.width / 2}
            y={drone.y - drone.height / 2}
            width={drone.width}
            height={drone.height}
            origin={{ x: drone.x, y: drone.y }}
            transform={[{ rotate: (drone.rotation * Math.PI) / 180 }]}
        />
    );
}

