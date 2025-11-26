import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../styles/splash.styles.js';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>HAPP</Text>
      <Text style={styles.slogan}>Help? Always Here!</Text>
    </View>
  );
}

// moved styles to src/styles/splash.styles.js
