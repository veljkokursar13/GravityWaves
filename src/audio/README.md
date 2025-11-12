# Audio System Architecture

Clean separation of concerns for audio management in Gravity Waves.

## Structure

```
src/
├── audio/
│   ├── AudioManager.ts          # Core audio logic (platform-agnostic)
│   ├── ExpoAudioBackend.ts      # Expo-specific audio backend implementation
│   ├── AudioProvider.tsx        # React context provider
│   └── README.md                # This file
├── hooks/
│   └── useAudio.ts              # Hook to access audio context
├── store/
│   └── audio.ts                 # Zustand store for persisted user preferences
└── components/
    └── AudioControls.tsx        # UI component for mute/unmute button
```

## Responsibilities

### AudioManager.ts
- **Pure business logic** for audio management
- Platform-agnostic interface (`IAudioBackend`)
- Manages music playback, SFX pools, volumes, mute state
- No React, no UI, no platform-specific code

### ExpoAudioBackend.ts
- **Platform adapter** implementing `IAudioBackend`
- Wraps `expo-audio` / `expo-av` with fallback logic
- Handles different API shapes across Expo versions
- Exports `configureAudioMode()` for iOS silent mode / Android ducking

### AudioProvider.tsx
- **React integration layer**
- Creates AudioManager instance with ExpoAudioBackend
- Syncs Zustand store (user prefs) ↔ AudioManager state
- Provides context API for components
- No UI rendering

### useAudio.ts
- **Convenience hook** to access AudioContext
- Throws error if used outside `<AudioProvider>`

### store/audio.ts
- **Persistent user preferences** (Zustand + AsyncStorage)
- Stores: `muted`, `musicVolume`, `sfxVolume`
- Survives app restarts

### AudioControls.tsx
- **UI component** for mute/unmute toggle
- Positioned absolutely (top-right)
- Uses `useAudioStore` directly (not `useAudio`)

## Usage

### Setup (in app/_layout.tsx)
```tsx
<AudioProvider preload={[
  { id: 'bgm', source: require('@/assets/audio/music.mp3'), kind: 'music' }
]}>
  <AudioControls />
  <Slot />
</AudioProvider>
```

### Play audio (in any component)
```tsx
import { useAudio } from '@/hooks/useAudio';

function MyComponent() {
  const audio = useAudio();
  
  const handlePlay = () => {
    audio.playMusic('bgm', { loop: true });
  };
  
  const handleSfx = () => {
    audio.playSfx('laser', { volume: 0.5 });
  };
  
  return <Button onPress={handlePlay}>Play</Button>;
}
```

### Access preferences (in any component)
```tsx
import { useAudioStore } from '@/store/audio';

function Settings() {
  const { musicVolume, setMusicVolume } = useAudioStore();
  return <Slider value={musicVolume} onChange={setMusicVolume} />;
}
```

## Data Flow

```
User Action → AudioControls → useAudioStore (Zustand)
                                      ↓
                              AudioProvider (syncs)
                                      ↓
                              AudioManager (logic)
                                      ↓
                              ExpoAudioBackend (platform)
                                      ↓
                              Native Audio APIs
```

## Benefits

✅ **Testable**: AudioManager is pure logic, easy to unit test  
✅ **Portable**: Swap ExpoAudioBackend for web/native backends  
✅ **Maintainable**: Clear boundaries between layers  
✅ **Reusable**: AudioControls can be placed anywhere  
✅ **Persistent**: User prefs survive app restarts  

