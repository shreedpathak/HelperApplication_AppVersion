import { StyleSheet } from 'react-native';
import theme from './theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
    paddingBottom: 20,
  },
  shimmerSmall: { height: 40, width: '60%', borderRadius: 10, marginBottom: 20 },
  shimmerLarge: { height: 180, width: '100%', borderRadius: 12, marginBottom: 20 },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 16,
    marginLeft: 5,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 15,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryIcon: {
    backgroundColor: theme.colors.subtle,
    borderRadius: 50,
    padding: 15,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  expandButton: {
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: theme.colors.subtle,
    borderRadius: 25,
    padding: 8,
    elevation: 2,
  },
  carouselItem: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default styles;
