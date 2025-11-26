import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/authContext.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../styles/theme.js';

export default function HelperReqScreen() {
  const [helpers, setHelpers] = useState([]);
  const [filteredHelpers, setFilteredHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [filterVisible, setFilterVisible] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  // separate pickers for date and time so user can pick date and time independently
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);


  // Request Form Fields
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [priceType, setPriceType] = useState('whole'); // whole / hourly
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  // start/end are empty until user picks them
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const { user } = useContext(AuthContext);
  const modalScrollRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const response = await axios.get('http://192.168.1.134:3001/api/helpers');
        const result = response.data.helpers || [];

        setHelpers(result);
        setFilteredHelpers(result);
      } catch (err) {
        setError('Failed to load helper profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpers();
  }, []);

  // SEARCH FUNCTION
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = helpers.filter((item) =>
      item.user?.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredHelpers(filtered);
  };

  // FILTER FUNCTION
  const applyFilter = (type) => {
    let sorted = [...filteredHelpers];

    if (type === 'location') {
      sorted.sort((a, b) => (a.area?.city || '').localeCompare(b.area?.city || ''));
    }
    if (type === 'rating') {
      sorted.sort((a, b) => (b.rating?.rating || 0) - (a.rating?.rating || 0));
    }
    if (type === 'price') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    setFilteredHelpers(sorted);
    setFilterVisible(false);
  };

  // SEND REQUEST
  const sendRequest = async () => {
    if (!reqTitle || !reqDescription || !price || !location || !address) {
      alert("All fields are required.");
      return;
    }

    // validate start/end presence and ordering
    if (!startTime || !endTime) {
      alert('Please select both start and end date/time.');
      return;
    }

    if (startTime > endTime) {
      alert('Start date/time cannot be after end date/time.');
      return;
    }

    const now = new Date();
    if (startTime < now || endTime < now) {
      alert('Start and End cannot be in the past.');
      return;
    }

    if (!selectedHelper) {
      alert('No helper selected. Please pick a helper from the list.');
      return;
    }

    // Accept either user._id or user.id (normalize in AuthContext but be defensive)
    const userId = user && (user._id || user.id);
    if (!user || !userId) {
      alert('You must be logged in to send a request.');
      return;
    }

    const payload = {
      helperUser: selectedHelper,
      neederUser: userId,
      reqTitle,
      reqDescription,
      // send ISO strings to ensure backend parses correctly
      reqStartTiming: startTime.toISOString(),
      reqEndTiming: endTime.toISOString(),
      priceType,
      price,
      location,
      address,
    };

    console.log('Sending request payload:', payload);

    try {
      const res = await axios.post("http://192.168.1.134:3001/api/request/create", payload);
      if (res.status === 201) {
        alert("Request Sent Successfully");
        setRequestModal(false);
      } else {
        console.warn('Unexpected response from server', res.status, res.data);
        alert('Unexpected response from server');
      }
    } catch (err) {
      console.error('Request error:', err?.response?.data || err.message || err);
      const msg = err?.response?.data?.error || 'Error sending request';
      alert(msg);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} size="large" color={theme.colors.primary} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.container, { paddingBottom: (insets?.bottom || 0) + 120 }]}
      >

        {/* SEARCH + FILTER */}
        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search helpers..."
            placeholderTextColor="#777"
            value={search}
            onChangeText={handleSearch}
          />

          <TouchableOpacity
            style={styles.filterBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setFilterVisible(true)}
          >
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* HELPER LIST */}
        {filteredHelpers.map((helper, index) => (
          <View key={index} style={styles.card}>
            <Image
              source={{ uri: helper.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.name}>{helper.user?.name}</Text>
              <Text style={styles.designation}>{helper.designation}</Text>
              <Text style={styles.location}>📍 {helper.area?.city}</Text>
            </View>

            {/* ADD REQUEST BUTTON */}
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                setSelectedHelper(helper._id);
                setRequestModal(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={36} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      {/* -------------------- CREATE REQUEST MODAL -------------------- */}
      <Modal visible={requestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <ScrollView ref={modalScrollRef} contentContainerStyle={styles.modalBoxContainer} keyboardShouldPersistTaps="handled">
                  <View style={styles.modalBox}>

                    <Text style={styles.modalTitle}>Create New Request</Text>

                    <TextInput placeholder="Request Title" style={styles.input} value={reqTitle} onChangeText={setReqTitle} />

                    <TextInput placeholder="Description" style={[styles.input, { height: 70 }]} multiline value={reqDescription} onChangeText={setReqDescription} />

                    {/* PRICE TOGGLE */}
                    <View style={styles.toggleRow}>
                      <TouchableOpacity style={[styles.toggleBtn, priceType === 'whole' && styles.activeToggleBtn]} onPress={() => setPriceType('whole')}>
                        <Text style={[styles.toggleText, priceType === 'whole' && styles.activeToggleText]}>Whole Work</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.toggleBtn, priceType === 'hourly' && styles.activeToggleBtn]} onPress={() => setPriceType('hourly')}>
                        <Text style={[styles.toggleText, priceType === 'hourly' && styles.activeToggleText]}>Hourly</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.priceRow}>
                      <TextInput placeholder="Price" keyboardType="numeric" style={[styles.input, { flex: 1 }]} value={price} onChangeText={setPrice} />
                      {priceType === 'hourly' && <Text style={styles.hrText}>/hr</Text>}
                    </View>

                    {/* DATE & TIME PICKERS */}
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowStartDatePicker(true)}>
                      <Text>{startTime ? startTime.toLocaleDateString() : 'Select start date'}</Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker value={startTime || new Date()} mode="date" display="default" onChange={(event, selectedDate) => {
                        const current = selectedDate || startTime || new Date();
                        if (selectedDate) {
                          setStartTime(prev => {
                            const base = prev ? new Date(prev) : new Date();
                            base.setFullYear(current.getFullYear(), current.getMonth(), current.getDate());
                            base.setSeconds(0);
                            base.setMilliseconds(0);
                            const now = new Date();
                            const candidate = base;
                            if (candidate < now) {
                              alert('Start date/time cannot be in the past.');
                              return prev;
                            }
                            if (endTime && candidate > endTime) {
                              alert('Start is after end; adjusting end time to match start.');
                              setEndTime(new Date(candidate));
                            }
                            return base;
                          });
                        }
                        setShowStartDatePicker(false);
                      }} />
                    )}

                    <Text style={styles.label}>Start Time</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowStartTimePicker(true)}>
                      <Text>{startTime ? startTime.toLocaleTimeString() : 'Select start time'}</Text>
                    </TouchableOpacity>
                    {showStartTimePicker && (
                      <DateTimePicker value={startTime || new Date()} mode="time" is24Hour={false} display="default" onChange={(event, selectedTime) => {
                        const current = selectedTime || startTime || new Date();
                        if (selectedTime) {
                          setStartTime(prev => {
                            const base = prev ? new Date(prev) : new Date();
                            base.setHours(current.getHours(), current.getMinutes());
                            base.setSeconds(0);
                            base.setMilliseconds(0);
                            const now = new Date();
                            const candidate = base;
                            if (candidate < now) {
                              alert('Start time cannot be in the past.');
                              return prev;
                            }
                            if (endTime && candidate > endTime) {
                              alert('Start cannot be after end; adjusting end to match start.');
                              setEndTime(new Date(candidate));
                            }
                            return base;
                          });
                        }
                        setShowStartTimePicker(false);
                      }} />
                    )}

                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowEndDatePicker(true)}>
                      <Text>{endTime ? endTime.toLocaleDateString() : 'Select end date'}</Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker value={endTime || new Date()} mode="date" display="default" onChange={(event, selectedDate) => {
                        const current = selectedDate || endTime || new Date();
                        if (selectedDate) {
                          setEndTime(prev => {
                            const base = prev ? new Date(prev) : new Date();
                            base.setFullYear(current.getFullYear(), current.getMonth(), current.getDate());
                            base.setSeconds(0);
                            base.setMilliseconds(0);
                            const now = new Date();
                            const candidate = base;
                            if (candidate < now) {
                              alert('End date/time cannot be in the past.');
                              return prev;
                            }
                            if (startTime && candidate < startTime) {
                              alert('End time cannot be before start time.');
                              return prev;
                            }
                            return base;
                          });
                        }
                        setShowEndDatePicker(false);
                      }} />
                    )}

                    <Text style={styles.label}>End Time</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowEndTimePicker(true)}>
                      <Text>{endTime ? endTime.toLocaleTimeString() : 'Select end time'}</Text>
                    </TouchableOpacity>
                    {showEndTimePicker && (
                      <DateTimePicker value={endTime || new Date()} mode="time" is24Hour={false} display="default" onChange={(event, selectedTime) => {
                        const current = selectedTime || endTime || new Date();
                        if (selectedTime) {
                          setEndTime(prev => {
                            const base = prev ? new Date(prev) : new Date();
                            base.setHours(current.getHours(), current.getMinutes());
                            base.setSeconds(0);
                            base.setMilliseconds(0);
                            const now = new Date();
                            const candidate = base;
                            if (candidate < now) {
                              alert('End time cannot be in the past.');
                              return prev;
                            }
                            if (startTime && candidate < startTime) {
                              alert('End time cannot be before start time.');
                              return prev;
                            }
                            return base;
                          });
                        }
                        setShowEndTimePicker(false);
                      }} />
                    )}

                    <TextInput placeholder="Location" style={styles.input} value={location} onChangeText={setLocation} />
                    <TextInput placeholder="Address" style={styles.input} value={address} onChangeText={setAddress} />

                    <TouchableOpacity style={styles.submitBtn} onPress={sendRequest}>
                      <Text style={styles.submitText}>Send Request</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setRequestModal(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* FILTER MODAL (unchanged) */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sort helpers by:</Text>

            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilter('location')}>
              <Text style={styles.modalBtnText}>📍 Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilter('rating')}>
              <Text style={styles.modalBtnText}>⭐ Rating</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={() => applyFilter('price')}>
              <Text style={styles.modalBtnText}>💰 Price</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setFilterVisible(false)}>
              <Text style={[styles.modalBtnText, { color: '#000' }]}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ------------------------------------------------------
                      STYLES
------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F6FA',
  },

  topBar: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
  },
  filterBtn: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  filterText: { color: '#fff', fontWeight: '600' },

  card: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: { width: 60, height: 60, borderRadius: 40, marginRight: 15, resizeMode: 'cover' },

  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: '#34495E' },
  designation: { color: '#7F8C8D' },
  location: { color: '#7F8C8D', marginTop: 4 },

  // ----------------- MODAL STYLES -----------------
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  modalBoxContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, color: '#2C3E50' },

  input: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#eaeaea',
    alignItems: 'center',
  },

  activeToggleBtn: {
    backgroundColor: '#4a90e2',
  },

  toggleText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },

  activeToggleText: {
    color: '#fff',
    fontWeight: '700',
  },

  dateBox: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  toggle: { padding: 10, color: '#777' },
  activeToggle: { padding: 10, color: '#4a90e2', fontWeight: '700' },

  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%' },
  hrText: { marginLeft: 5, fontSize: 16, fontWeight: '600', color: '#4a90e2' },

  label: { marginBottom: 5, fontWeight: '600' },

  modalBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  modalBtnText: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '600',
  },

  submitBtn: {
    backgroundColor: '#4a90e2',
    padding: 13,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  submitText: { color: '#fff', fontWeight: '700', textAlign: 'center' },

  cancelBtn: { marginTop: 10, padding: 10, width: '100%' },
  cancelText: { textAlign: 'center', color: '#333' },
});
