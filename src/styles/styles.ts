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
    backgroundColor: 'rgba(0,0,0,0.35)', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
},
mainMenuTitle: {
  fontFamily: 'AstronValley',
  fontSize: 40,
  color: '#fff',
  },
  mainMenuDescription: {
    fontFamily: 'Quantico',
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default styles;
