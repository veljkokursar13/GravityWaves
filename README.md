# Gravity Waves

A space shooter game built with React Native, Expo, and Skia.

## 🚀 Features

- **Gravity Wave Mechanics**: Use gravity fields to distort enemy trajectories
- **Wave-based Gameplay**: Increasingly difficult enemy waves
- **Modern Architecture**: Clean, modular codebase with TypeScript
- **Skia-powered Graphics**: Smooth 60 FPS rendering with React Native Skia
- **State Management**: Zustand for predictable game state

## 📁 Project Structure

```
GravityWaves/
├── app/                         # expo-router
│   ├── _layout.tsx              # wraps ThemeProvider, Nav, etc.
│   └── index.tsx                # main menu or entry screen
│
├── src/
│   ├── core/                    # gameplay engine & main systems
│   │   ├── GameEngine.tsx       # central update/render logic
│   │   ├── GameScreen.tsx       # visual layout (Canvas + UI)
│   │   └── overlays/            # HUD, Pause, GameOver overlays
│   │
│   ├── components/              # reusable Skia or RN components
│   │   ├── Ship.tsx
│   │   ├── Enemy.tsx
│   │   ├── Bullet.tsx
│   │   ├── Explosion.tsx
│   │   └── GravityWave.tsx
│   │
│   ├── systems/                 # logical systems (hooks or modules)
│   │   ├── useDeltaTime.ts      # clock-based timing
│   │   ├── useStars.ts          # background star generation
│   │   ├── useSpawner.ts        # enemy spawn logic
│   │   ├── usePhysics.ts        # movement, collisions
│   │   └── useGravityField.ts   # gravity wave distortion
│   │
│   ├── store/                   # Zustand global state
│   │   └── gameStore.ts
│   │
│   ├── context/                 # global providers
│   │   ├── themeProvider.tsx
│   │   └── themeComponents/
│   │       └── DeepSpace.tsx    # animated starfield bg
│   │
│   ├── hooks/                   # UI and system hooks
│   │   ├── useTheme.ts
│   │   ├── useControls.ts
│   │   └── useGameState.ts
│   │
│   ├── assets/                  # images, fonts, sounds
│   │   ├── ships/
│   │   ├── enemies/
│   │   ├── sounds/
│   │   ├── fonts/
│   │   └── particles/
│   │
│   ├── styles/
│   │   └── styles.ts            # global style constants
│   │
│   └── utils/
│       ├── math.ts              # vector math, clamp, distance, etc.
│       ├── constants.ts         # screen, speed, difficulty
│       └── random.ts            # RNG helpers
│
└── assets/                      # Expo default assets folder (icons)
```

## 🛠️ Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 🎮 How to Play

- **Touch/Drag**: Move your ship
- **Gravity Wave**: Tap special button to create gravity field
- **Objective**: Survive waves of enemies and maximize your score

## 🏗️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain and platform
- **TypeScript** - Type safety and better DX
- **React Native Skia** - High-performance 2D graphics
- **Zustand** - Lightweight state management
- **expo-router** - File-based navigation

## 📝 Development

### Key Systems

- **Game Loop**: Centralized in `GameEngine.tsx` with delta-time based updates
- **Physics**: Collision detection and movement in `systems/usePhysics.ts`
- **Spawning**: Wave-based enemy spawning in `systems/useSpawner.ts`
- **Gravity**: Field-based trajectory modification in `systems/useGravityField.ts`

### Adding New Features

1. Components go in `src/components/`
2. Game logic hooks in `src/systems/`
3. UI overlays in `src/core/overlays/`
4. Global state in `src/store/gameStore.ts`

## 🎨 Customization

Edit constants in `src/utils/constants.ts` to adjust:
- Player speed and fire rate
- Enemy types and stats
- Bullet speeds and damage
- Wave difficulty scaling

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contribution guidelines first.

