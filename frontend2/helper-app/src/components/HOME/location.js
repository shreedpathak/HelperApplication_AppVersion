import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, Alert, Platform } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import styles from '../../styles/home.styles.js';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'saved_locations_v1';
// Optional: provide your Google Places API key here (or inject via config). If empty, falls back to expo Location.geocodeAsync
const GOOGLE_PLACES_API_KEY = '';

export default function LocationScreen({ logout }) {
  const [currentAddress, setCurrentAddress] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [existingVisible, setExistingVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [region, setRegion] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);

  // Form fields
  const [labelType, setLabelType] = useState('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');

  const mapRef = useRef(null);
  const [mapSearch, setMapSearch] = useState('');
  const [mapResults, setMapResults] = useState([]);
  const [mapPredictions, setMapPredictions] = useState([]); // Google Places predictions
  const searchTimer = useRef(null);
  const placeSession = useRef(null);

  useEffect(() => {
    // load saved locations
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSavedLocations(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load saved locations', e);
      }
    })();
  }, []);

  const openOptions = () => setOptionsVisible(true);

  const chooseExisting = () => {
    setOptionsVisible(false);
    setExistingVisible(true);
  };

  const chooseLive = async () => {
    setOptionsVisible(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is required to pick live location.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // store last known user location for distance calculations
      setUserLocation({ latitude: lat, longitude: lng });
      setSelectedCoords({ latitude: lat, longitude: lng });
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMapVisible(true);
    } catch (err) {
      console.error('Error getting current position', err);
      Alert.alert('Error', 'Unable to get current location.');
    }
  };

  // keep track of device location to compute nearby distances
  const [userLocation, setUserLocation] = useState(null);

  const onMapRegionChangeComplete = (reg) => {
    setRegion(reg);
    setSelectedCoords({ latitude: reg.latitude, longitude: reg.longitude });
  };

  const selectLocationFromMap = async () => {
    if (!selectedCoords) return;
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude: selectedCoords.latitude, longitude: selectedCoords.longitude });
      // pick first result
      const info = rev && rev[0];
      const addr = info?.name || info?.street || info?.region || '';
      setAddressLine1(info?.name || info?.street || '');
      setAddressLine2(info?.street || '');
      setAddressLine3(info?.district || info?.subregion || '');
      setPincode(info?.postalCode || '');
      setCity(info?.city || info?.region || '');
      setStateVal(info?.region || info?.country || '');
      setFormVisible(true);
      setMapVisible(false);
    } catch (err) {
      console.error('Reverse geocode failed', err);
      Alert.alert('Error', 'Failed to get address from location.');
    }
  };

  const handleMapSearch = async () => {
    if (!mapSearch || mapSearch.trim().length === 0) return;
    try {
      if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY.length > 5) {
        // Use Google Places Autocomplete for richer multi-suggestions
        const q = encodeURIComponent(mapSearch);
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${q}&key=${GOOGLE_PLACES_API_KEY}&types=geocode`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === 'OK' && Array.isArray(json.predictions)) {
          setMapPredictions(json.predictions);
          setMapResults([]);
        } else {
          setMapPredictions([]);
          Alert.alert('No results', 'No location found for that query.');
        }
      } else {
        const results = await Location.geocodeAsync(mapSearch);
        // show multiple suggestions instead of auto-selecting first
        setMapResults(results || []);
        if (!results || results.length === 0) {
          Alert.alert('No results', 'No location found for that query.');
        }
      }
    } catch (err) {
      console.error('Geocode search failed', err);
      Alert.alert('Error', 'Search failed.');
    }
  };

  const onMapSearchChange = (text) => {
    setMapSearch(text);
    // debounce
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text || text.trim().length < 2) {
      setMapResults([]);
      setMapPredictions([]);
      placeSession.current = null;
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY.length > 5) {
          // initialize a session token for this autocomplete session for better billing & grouping
          if (!placeSession.current) placeSession.current = Date.now().toString();
          const q = encodeURIComponent(text);
          const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${q}&key=${GOOGLE_PLACES_API_KEY}&types=geocode&sessiontoken=${placeSession.current}`;
          const res = await fetch(url);
          const json = await res.json();
          if (json.status === 'OK' && Array.isArray(json.predictions)) {
            // limit to first 6 predictions for UX parity with consumer apps
            setMapPredictions((json.predictions || []).slice(0, 6));
          } else {
            setMapPredictions([]);
          }
        } else {
          const results = await Location.geocodeAsync(text);
          // results: array of { latitude, longitude, ... }
          setMapResults(results || []);
        }
      } catch (err) {
        console.error('Geocode (debounced) failed', err);
        setMapResults([]);
        setMapPredictions([]);
      }
    }, 250);
  };

  // If using Google Places, fetch place details to get lat/lng
  const fetchPlaceDetails = async (placeId) => {
    if (!placeId) return null;
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'OK' && json.result && json.result.geometry && json.result.geometry.location) {
        const loc = json.result.geometry.location; // { lat, lng }
        return { latitude: loc.lat, longitude: loc.lng, address: json.result.formatted_address };
      }
    } catch (err) {
      console.error('Place details fetch failed', err);
    }
    return null;
  };

  const selectSearchResult = (res) => {
    if (!res) return;
    // res may be a geocode result (with latitude/longitude) or a Google prediction
    if (res.latitude && res.longitude) {
      const lat = res.latitude;
      const lng = res.longitude;
      const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      setSelectedCoords({ latitude: lat, longitude: lng });
      if (mapRef.current && mapRef.current.animateToRegion) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      // update the search box and clear suggestions
      const label = formatAddress(res) || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setMapSearch(label);
      setMapResults([]);
      setMapPredictions([]);
    } else if (res.place_id) {
      // Google prediction selected
      (async () => {
        const details = await fetchPlaceDetails(res.place_id);
        if (details) {
          const newRegion = { latitude: details.latitude, longitude: details.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
          setRegion(newRegion);
          setSelectedCoords({ latitude: details.latitude, longitude: details.longitude });
          if (mapRef.current && mapRef.current.animateToRegion) {
            mapRef.current.animateToRegion(newRegion, 500);
          }
          setMapSearch(details.address || res.description || '');
          setMapPredictions([]);
          setMapResults([]);
        } else {
          Alert.alert('Error', 'Failed to load place details');
        }
      })();
    }
  };

  const formatAddress = (item) => {
    if (!item) return '';
    // item may contain: name, street, city, region, postalCode, country
    const parts = [];
    if (item.name) parts.push(item.name);
    if (item.street && item.street !== item.name) parts.push(item.street);
    if (item.city) parts.push(item.city);
    if (item.region && !parts.includes(item.region)) parts.push(item.region);
    if (item.postalCode) parts.push(item.postalCode);
    if (item.country) parts.push(item.country);
    return parts.join(', ');
  };

  const calcDistanceKm = (a, b) => {
    if (!a || !b) return null;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const saveLocation = async () => {
    if (!addressLine1 && !addressLine2) {
      Alert.alert('Validation', 'Please provide an address line.');
      return;
    }
    const newLoc = {
      id: Date.now().toString(),
      label: labelType,
      addressLine1,
      addressLine2,
      addressLine3,
      pincode,
      city,
      state: stateVal,
      coords: selectedCoords,
    };
    const arr = [newLoc, ...savedLocations];
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      setSavedLocations(arr);
      setCurrentAddress(`${labelType}: ${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}`);
      setFormVisible(false);
      Alert.alert('Saved', 'Location saved successfully');
    } catch (e) {
      console.error('Failed to save location', e);
      Alert.alert('Error', 'Failed to save location');
    }
  };

  const selectExistingLocation = (loc) => {
    setCurrentAddress(`${loc.label}: ${loc.addressLine1}${loc.addressLine2 ? ', ' + loc.addressLine2 : ''}`);
    setExistingVisible(false);
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.locationRow} onPress={openOptions}>
        <Icon name="location-outline" size={22} color="#007AFF" />
        <Text style={styles.address}>{currentAddress || 'Set your location'}</Text>
      </TouchableOpacity>
      <Icon name="log-out-outline" size={26} color="#FF3B30" onPress={logout} />

      {/* Options Modal */}
      <Modal visible={optionsVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ flexDirection: 'column', backgroundColor: '#fff', padding: 12, borderRadius: 12, width: '80%' }}>
            <TouchableOpacity style={{ padding: 12, marginVertical: 6, alignItems: 'flex-start' }} onPress={chooseLive}>
              <Text style={{ fontWeight: '700' }}>Choose Live Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12, marginVertical: 6, alignItems: 'flex-start' }} onPress={chooseExisting}>
              <Text style={{ fontWeight: '700' }}>Choose Existing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 12, marginVertical: 6, alignItems: 'flex-start' }} onPress={() => setOptionsVisible(false)}>
              <Text style={{ color: '#777' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={region}
            region={region}
            onRegionChangeComplete={onMapRegionChangeComplete}
            showsUserLocation
          >
            {selectedCoords && (
              <Marker coordinate={selectedCoords} />
            )}
          </MapView>

          {/* Search bar on map */}
          <View style={{ position: 'absolute', top: 40, left: 16, right: 16 }}>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                placeholder="Search location or address"
                value={mapSearch}
                onChangeText={onMapSearchChange}
                style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
              />
              <TouchableOpacity onPress={handleMapSearch} style={{ marginLeft: 8, backgroundColor: '#4a90e2', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Suggestions dropdown: show Google predictions first (if any), otherwise show geocode results */}
            {(mapPredictions && mapPredictions.length > 0) && (
              <View style={{ marginTop: 8, backgroundColor: 'white', borderRadius: 8, maxHeight: 240, overflow: 'hidden' }}>
                <FlatList
                  data={mapPredictions}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => {
                    const main = item.structured_formatting?.main_text || item.description || item.place_id;
                    const secondary = item.structured_formatting?.secondary_text || '';
                    return (
                      <TouchableOpacity onPress={() => selectSearchResult(item)} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontWeight: '600' }}>{main}</Text>
                        {secondary ? <Text style={{ color: '#666', fontSize: 12 }}>{secondary}</Text> : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
            {(!mapPredictions || mapPredictions.length === 0) && (mapResults && mapResults.length > 0) && (
              <View style={{ marginTop: 8, backgroundColor: 'white', borderRadius: 8, maxHeight: 200, overflow: 'hidden' }}>
                <FlatList
                  data={mapResults}
                  keyExtractor={(item, idx) => `${item.latitude}_${item.longitude}_${idx}`}
                  renderItem={({ item }) => {
                    const label = formatAddress(item) || `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`;
                    const refPoint = userLocation || region || selectedCoords || null;
                    const dist = refPoint ? calcDistanceKm(refPoint, { latitude: item.latitude, longitude: item.longitude }) : null;
                    return (
                      <TouchableOpacity onPress={() => selectSearchResult(item)} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontWeight: '600' }}>{label}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#666', fontSize: 12 }}>{`${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`}</Text>
                          {dist !== null && (
                            <Text style={{ color: '#666', fontSize: 12 }}>{`${dist < 1 ? (dist * 1000).toFixed(0) + ' m' : dist.toFixed(2) + ' km'}`}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>

          <View style={{ position: 'absolute', bottom: 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setMapVisible(false)} style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectLocationFromMap} style={{ backgroundColor: '#4a90e2', padding: 8, borderRadius: 8 }}>
              <Text style={{ color: 'white' }}>Use this location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Existing Locations Modal */}
      <Modal visible={existingVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, maxHeight: '70%' }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Choose saved location</Text>
            <FlatList
              data={savedLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectExistingLocation(item)} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                  <Text style={{ fontWeight: '600' }}>{item.label}</Text>
                  <Text style={{ color: '#666' }}>{item.addressLine1}{item.addressLine2 ? ', ' + item.addressLine2 : ''}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: '#666' }}>No saved locations</Text>}
            />
            <TouchableOpacity onPress={() => setExistingVisible(false)} style={{ marginTop: 12, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#007AFF' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Address Form Modal */}
      <Modal visible={formVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 12 }}>Save Location</Text>

          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => setLabelType('Home')} style={{ marginRight: 8, padding: 8, backgroundColor: labelType === 'Home' ? '#4a90e2' : '#eee', borderRadius: 8 }}>
              <Text style={{ color: labelType === 'Home' ? 'white' : '#333' }}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLabelType('Work')} style={{ marginRight: 8, padding: 8, backgroundColor: labelType === 'Work' ? '#4a90e2' : '#eee', borderRadius: 8 }}>
              <Text style={{ color: labelType === 'Work' ? 'white' : '#333' }}>Work</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLabelType('Other')} style={{ padding: 8, backgroundColor: labelType === 'Other' ? '#4a90e2' : '#eee', borderRadius: 8 }}>
              <Text style={{ color: labelType === 'Other' ? 'white' : '#333' }}>Other</Text>
            </TouchableOpacity>
          </View>

          <TextInput placeholder="Address line 1" value={addressLine1} onChangeText={setAddressLine1} style={{ padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8, marginBottom: 8 }} />
          <TextInput placeholder="Address line 2 (street)" value={addressLine2} onChangeText={setAddressLine2} style={{ padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8, marginBottom: 8 }} />
          <TextInput placeholder="Address line 3 (landmark)" value={addressLine3} onChangeText={setAddressLine3} style={{ padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8, marginBottom: 8 }} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput placeholder="Pincode" value={pincode} onChangeText={setPincode} style={{ flex: 1, padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8 }} />
            <TextInput placeholder="City" value={city} onChangeText={setCity} style={{ flex: 1, padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8 }} />
          </View>
          <TextInput placeholder="State" value={stateVal} onChangeText={setStateVal} style={{ padding: 8, backgroundColor: '#f1f1f1', borderRadius: 8, marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity onPress={() => setFormVisible(false)} style={{ padding: 10 }}>
              <Text style={{ color: '#777' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveLocation} style={{ padding: 10, backgroundColor: '#4a90e2', borderRadius: 8 }}>
              <Text style={{ color: 'white' }}>Save Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
