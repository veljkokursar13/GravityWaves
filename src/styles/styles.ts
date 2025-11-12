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
  fontSize: 36,
  color: '#fff',
  textAlign: 'center',
  marginBottom: 16, 
  textShadowColor: '#000',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
 },
  mainMenuDescription: {
    fontFamily: 'OrbitronBold',
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
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
