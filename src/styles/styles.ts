import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Orbitron',
    fontSize: 40,
    color: '#fff',
  },
  mainMenuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

mainMenuTitle: {
  fontFamily: 'AstronValleyBold',
  fontSize: 48,
  color: '#fff',
  textAlign: 'center',
  marginBottom: 16, 
  // AAA neon glow effect
  textShadowColor: 'rgba(0, 220, 255, 1)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 20,
 },
  mainMenuDescription: {
    fontFamily: 'OrbitronBold',
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.95,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
    // Subtle glow
    textShadowColor: 'rgba(162, 171, 88, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  pauseIcon: {
    color: '#ffffff',
    top: 35,
    right: 65,
    position: 'absolute',
    zIndex: 1000,
  },
});

export default styles;

export const overlayStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
});
