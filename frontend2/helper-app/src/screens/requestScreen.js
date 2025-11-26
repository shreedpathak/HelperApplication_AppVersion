import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext.js';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme.js';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.134:3001';

export default function RequestsScreen() {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortOption, setSortOption] = useState(null); // 'name' | 'date' | 'location' | 'active' | 'completed'

  // fetchRequests is reusable for initial load and refresh
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const userId = user && (user._id || user.id);
      const url = userId ? `${BASE_URL}/api/request/fetch?neederUser=${userId}` : `${BASE_URL}/api/request/fetch`;
      const res = await axios.get(url);
      const data = res.data || [];
      setRequests(data);
      setFilteredRequests(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load requests', err?.response?.data || err.message || err);
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    } catch (e) {
      return iso;
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const t = text.toLowerCase();
    const filtered = requests.filter((r) => {
      const title = (r.reqTitle || '').toLowerCase();
      const helperName = (r.helperUser?.name || r.helperUser?.user?.name || '').toLowerCase();
      const loc = (r.location || '').toLowerCase();
      return title.includes(t) || helperName.includes(t) || loc.includes(t);
    });
    setFilteredRequests(applySortToList(filtered, sortOption));
  };

  const applySortToList = (list, option) => {
    if (!option) return list;
    const copy = [...list];
    if (option === 'name') {
      copy.sort((a, b) => ( (a.reqTitle || '') .localeCompare(b.reqTitle || '') ));
    } else if (option === 'date') {
      copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === 'location') {
      copy.sort((a, b) => ( (a.location || '') .localeCompare(b.location || '') ));
    } else if (option === 'active') {
      copy.sort((a, b) => (a.status === 'pending' ? -1 : 1));
    } else if (option === 'completed') {
      copy.sort((a, b) => (a.status === 'completed' ? -1 : 1));
    }
    return copy;
  };

  const applyFilterOption = (option) => {
    setSortOption(option);
    setFilterVisible(false);
    setFilteredRequests(applySortToList(filteredRequests, option));
  };

  const handleRefresh = () => {
    fetchRequests();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#4a90e2" />;

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: (insets?.top || 0) + 16 }]}>
      <Image
        source={require('../../assets/icon.png')}
        style={styles.image}
      />
      <Text style={styles.title}>My Requests</Text>
      <Text style={styles.subtitle}>Here you can view all your submitted requests.</Text>

      {/* Top controls: Search, Filter, Refresh */}
      <View style={styles.topControls}>
        <TextInput
          placeholder="Search requests..."
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />

        <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterVisible(true)}>
          <Text style={styles.iconBtnText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handleRefresh}>
          <Text style={styles.iconBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}

      {filteredRequests.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No requests found</Text>
          <Text style={styles.cardDetail}>You haven't submitted any requests yet.</Text>
        </View>
      )}

      {filteredRequests.map((r) => (
        <View key={r._id || r.id} style={styles.card}>
          <Text style={styles.cardTitle}>{r.reqTitle}</Text>
          <Text style={styles.cardDetail}>Status: {r.status}</Text>
          <Text style={styles.cardDetail}>Start: {formatDate(r.reqStartTiming)}</Text>
          <Text style={styles.cardDetail}>End: {formatDate(r.reqEndTiming)}</Text>
          <Text style={styles.cardDetail}>Submitted: {new Date(r.createdAt).toLocaleDateString()}</Text>
          {/* Chat button: opens Chat tab with the other participant */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#2ecc71' }]}
              onPress={() => {
                // determine other user for chat: prefer helperUser, else neederUser
                const helper = r.helperUser || (r.helperUser && r.helperUser.user) || null;
                const needer = r.neederUser || (r.neederUser && r.neederUser.user) || null;
                let other = null;
                if (helper && (helper._id || helper.id)) other = { id: helper._id || helper.id, name: helper.name || (helper.user && helper.user.name) || 'Helper' };
                else if (needer && (needer._id || needer.id)) other = { id: needer._id || needer.id, name: needer.name || (needer.user && needer.user.name) || 'Needer' };
                else if (r.helperUser && r.helperUser.name) other = { id: r.helperUser._id || r.helperUser.id || `${r._id}_helper`, name: r.helperUser.name };
                else other = { id: `${r._id}_req`, name: r.reqTitle || 'Request' };

                navigation.navigate('ChatWindow', { chatUser: other, request: r });
              }}
            >
              <Text style={styles.iconBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sort / Filter</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilterOption('name')}>
              <Text style={styles.modalBtnText}>Sort by Name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilterOption('date')}>
              <Text style={styles.modalBtnText}>Sort by Date</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilterOption('location')}>
              <Text style={styles.modalBtnText}>Sort by Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilterOption('active')}>
              <Text style={styles.modalBtnText}>Show Active First</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilterOption('completed')}>
              <Text style={styles.modalBtnText}>Show Completed First</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setFilterVisible(false)}>
              <Text style={[styles.modalBtnText, { color: '#000' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  topControls: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  iconBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '600',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
