import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FBFBFF' },
  brand: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 24, color: '#0B3D91' },
  modeSwitch: { flexDirection: 'row', alignSelf: 'center', marginBottom: 18, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  modeBtn: { paddingVertical: 10, paddingHorizontal: 18 },
  modeBtnActive: { backgroundColor: '#0B3D91' },
  modeText: { color: '#0B3D91', fontWeight: '600' },
  modeTextActive: { color: '#fff' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E6E9F0' },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  roleLabel: { marginRight: 12, color: '#333', fontWeight: '600' },
  roleBtn: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E6E9F0' },
  roleBtnActive: { backgroundColor: '#2E8B57', borderColor: '#2E8B57' },
  roleBtnText: { color: '#333' },
  roleBtnTextActive: { color: '#fff', fontWeight: '700' },
  primaryBtn: { backgroundColor: '#0B3D91', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  or: { textAlign: 'center', color: '#888', marginVertical: 12, fontWeight: '600' },
  googleBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E6E9F0', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  googleText: { color: '#444', fontWeight: '700' },
});

export default styles;
