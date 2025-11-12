# Game Entities

This directory contains all renderable game objects using React Native Skia for high-performance canvas rendering.

## Setup Required

### Install Skia

**IMPORTANT**: Stop the Metro bundler/Expo dev server first to avoid file lock errors.

```bash
# Stop any running dev servers (Ctrl+C in terminal)
# Then install:
npx expo install @shopify/react-native-skia

# Or with pnpm:
pnpm add @shopify/react-native-skia
```

After installation, restart your dev server.

## Structure

```
entities/
├── ship/
│   ├── Ship.tsx           # Player ship rendering component
│   ├── ShipControlls.ts   # Input handling (touch + keyboard)
│   └── types.ts           # Ship type definitions
├── enemies/               # TODO: Enemy ships
├── projectiles/           # TODO: Bullets, missiles
└── README.md
```

## Usage Example

```typescript
import { Canvas } from '@shopify/react-native-skia';
import Ship from '@/entities/ship/Ship';
import { useState } from 'react';

function GameCanvas() {
  const [ship, setShip] = useState({
    id: 'player',
    x: 200,
    y: 400,
    width: 60,
    height: 80,
    speed: 5,
    direction: 0,
    rotation: 0,
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Ship ship={ship} />
    </Canvas>
  );
}
```

## Why Skia?

- **Performance**: Hardware-accelerated 2D graphics
- **Smooth animations**: 60fps+ rendering
- **Flexibility**: Direct canvas control for complex effects
- **Cross-platform**: Works on iOS, Android, and Web

## Controls

### Mobile
- Touch/drag to move the ship

### Desktop/Web
- Arrow keys or WASD to move
- Ship stays within screen bounds

## Next Steps

1. Install `@shopify/react-native-skia`
2. Integrate Ship into `GameScreen.tsx` or `GameEngine.tsx`
3. Add ship state to `src/store/gameState.ts`
4. Create enemy entities following the same pattern
5. Add collision detection system in `src/core/systems/`

