import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import styles from '../../styles/home.styles.js';

// Declaring Constants, later will be migrated to env file
const { width } = Dimensions.get('window');
const categoriesFetchUrl = 'http://192.168.1.134:3001/api/category';

export default function Home({ scrollRef }) {
  
  //Declarations of all hooks and variables
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const arrowAnim = useRef(new Animated.Value(0)).current; // rotate
  const displayedCategories = showAll ? categories : categories.slice(0, 9);

  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------
  
  // Arrow rotation interpolation
  const rotateInterpolate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Adding UseEffect to fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(categoriesFetchUrl);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Toggle categories view and animate arrow
  const toggleCategories = () => {
    const toValue = showAll ? 0 : 1;
    setShowAll(!showAll);

    // smooth arrow animation
    Animated.timing(arrowAnim, {
      toValue,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // smooth scroll
    if (scrollRef?.current) {
      const startY = showAll ? 400 : 0;
      const endY = showAll ? 0 : 400;
      const duration = 100;
      const steps = 80;
      const interval = duration / steps;
      let currentStep = 0;

      const smoothScroll = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = Easing.inOut(Easing.ease)(progress);
        const y = startY + (endY - startY) * easedProgress;
        scrollRef.current.scrollTo({ y, animated: false });
        if (currentStep >= steps) clearInterval(smoothScroll);
      }, interval);
    }
  };

  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------

  return (
    <View style={{ paddingBottom: insets.bottom }}>
      {/* 🔹 Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#888" />
        <TextInput placeholder="Search for services..." style={styles.searchInput} />
      </View>

      {/* 🔹 Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View>
        <View style={styles.categoriesGrid}>
          {displayedCategories.map((cat, index) => (
            <View style={styles.categoryItem} key={index}>
              <View style={styles.categoryIcon}>
                <Icon name={cat.icon || 'apps-outline'} size={26} color="#007AFF" />
              </View>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </View>
          ))}
        </View>

        {/* 🔹 Expand / Collapse Button */}
        {categories.length > 9 && (
          <TouchableOpacity style={styles.expandButton} onPress={toggleCategories}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <Icon name="chevron-down-outline" size={28} color="#007AFF" />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}