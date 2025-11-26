import { useContext, useRef, useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/authContext.js';
import styles from '../styles/home.styles.js';
import Home from '../components/HOME/home.js';
import LocationScreen from '../components/HOME/location.js';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);

  // Simulate API/data loading — ideally, set this false when category API completes
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.screen}>
          {isLoading ? (
            <>
              {/* 🔹 Skeleton for Location */}
              <ShimmerPlaceHolder LinearGradient={LinearGradient} style={styles.shimmerSmall} />

              {/* 🔹 Skeleton for Category/Home Section */}
              <ShimmerPlaceHolder LinearGradient={LinearGradient} style={styles.shimmerLarge} />
              <ShimmerPlaceHolder LinearGradient={LinearGradient} style={styles.shimmerLarge} />

              {/* 🔹 Skeleton for Offers */}
              <ShimmerPlaceHolder LinearGradient={LinearGradient} style={{ height: 120, width: '100%', borderRadius: 10, marginBottom: 20 }} />
            </>
          ) : (
            <>
              <LocationScreen logout={logout} />
              <Home scrollRef={scrollRef} setLoading={setIsLoading} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
