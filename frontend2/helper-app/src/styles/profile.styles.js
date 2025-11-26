import { StyleSheet } from 'react-native';
import theme from './theme';

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: theme.colors.background, alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 20, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  email: { color: theme.colors.muted, marginBottom: 8 },
  card: { width: '100%', backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  cardText: { color: '#556' },
});

export default styles;
