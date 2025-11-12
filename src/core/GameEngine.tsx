import { Canvas, Group } from "@shopify/react-native-skia";
import Ship from "@/entities/ship/Ship";
import { initialShip } from "@/entities/ship/types";

export default function GameEngine() {
    return(
        <Canvas style={{ flex: 1 }}>
            <Group>
                <Ship ship={initialShip} />
            </Group>
        </Canvas>
    )
}