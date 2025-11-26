import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: Math.min(220, width * 0.6),
    height: Math.min(220, width * 0.6),
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#222',
    marginTop: 6,
  },
  slogan: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
});

export default styles;
