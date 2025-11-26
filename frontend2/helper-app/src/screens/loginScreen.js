import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import styles from '../styles/login.styles.js';

const BASE_URL = 'http://192.168.1.134:3001';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'needer' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) return Alert.alert('Please enter email and password');
    try {
      setLoading(true);
      console.log('Handling login. Form data:', form);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { email: form.email, password: form.password });
      const user = res.data.user;
      login(user);
      console.log('Logged in user:', user);
    } catch (err) {
      console.error('Login error:', err?.response?.data || err.message || err);
      Alert.alert('Login failed', err?.response?.data?.message || 'Please check your credentials or network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) return Alert.alert('Please fill all the fields');
    try {
      setLoading(true);
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
      const res = await axios.post(`${BASE_URL}/api/auth/register`, payload);
      const user = res.data.user || res.data;
      login(user);
      console.log('Registered and logged in:', user);
    } catch (err) {
      console.error('Signup error:', err?.response?.data || err.message || err);
      Alert.alert('Signup failed', err?.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    // Placeholder stub. Integrate Expo Google / Firebase auth here.
    Alert.alert('Google Sign-In', 'Google authentication is not configured in this build.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Helper App</Text>

        <View style={styles.modeSwitch}>
          <TouchableOpacity onPress={() => setMode('login')} style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}>
            <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('signup')} style={[styles.modeBtn, mode === 'signup' && styles.modeBtnActive]}>
            <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <TextInput
            placeholder="Full name"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
          secureTextEntry
          style={styles.input}
        />

        {mode === 'signup' && (
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>I am a</Text>
            <TouchableOpacity onPress={() => setForm({ ...form, role: 'helper' })} style={[styles.roleBtn, form.role === 'helper' && styles.roleBtnActive]}>
              <Text style={[styles.roleBtnText, form.role === 'helper' && styles.roleBtnTextActive]}>Helper</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForm({ ...form, role: 'needer' })} style={[styles.roleBtn, form.role === 'needer' && styles.roleBtnActive]}>
              <Text style={[styles.roleBtnText, form.role === 'needer' && styles.roleBtnTextActive]}>Needer</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
        >
          <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
        </TouchableOpacity>

        <Text style={styles.or}>OR</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// styles moved to src/styles/login.styles.js
