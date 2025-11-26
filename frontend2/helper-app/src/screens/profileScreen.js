import React, { useContext } from 'react';
import { AuthContext } from '../context/authContext.js';
import { View, Text, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme.js';
import styles from '../styles/profile.styles.js';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: (insets?.top || 0) + 16 }]}>
      <View style={styles.header}>
        <Image source={require('../../assets/icon.png')} style={styles.avatar} />
        <Text style={styles.name}>{user?.name || 'Your Name'}</Text>
        <Text style={styles.email}>{user?.email || 'you@example.com'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>This is your profile. You can add more details like bio, skills and contact information here.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Role</Text>
        <Text style={styles.cardText}>{user?.role || 'needer'}</Text>
      </View>
    </ScrollView>
  );
}

// styles moved to src/styles/profile.styles.js