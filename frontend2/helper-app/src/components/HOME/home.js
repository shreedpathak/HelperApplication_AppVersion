import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import styles from '../../styles/home.styles.js';

const ads = [
  { id: 1, color: '#FF6B6B', title: 'Special Offer!' },
  { id: 2, color: '#4ECDC4', title: '50% Off on Services!' },
  { id: 3, color: '#FFD93D', title: 'Limited Time Deal!' },
];

const { width, height } = Dimensions.get('window');
const categoriesFetchUrl = 'http://192.168.1.134:3001/api/category';

export default function Home({ scrollRef }) {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [popupAnim] = useState(new Animated.Value(0));
  const [helpers, setHelpers] = useState([]);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const displayedCategories = showAll ? categories : categories.slice(0, 9);

  // Rotate interpolation for arrow
  const rotateInterpolate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Fetch categories
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

  // Expand / collapse category view
  const toggleCategories = () => {
    const toValue = showAll ? 0 : 1;
    setShowAll(!showAll);

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
      const duration = 500;
      const steps = 80;
      const interval = duration / steps;
      let currentStep = 0;

      const smoothScroll = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const eased = Easing.inOut(Easing.ease)(progress);
        const y = startY + (endY - startY) * eased;
        scrollRef.current.scrollTo({ y, animated: false });
        if (currentStep >= steps) clearInterval(smoothScroll);
      }, interval);
    }
  };

  // Show category popup
// New state

  const openCategoryPopup = async (category) => {
    setSelectedCategory(category);

    try {
      const res = await fetch(`http://192.168.1.134:3001/api/helpers/category/${category._id}`);
      const data = await res.json();
      setHelpers(data);
    } catch (err) {
      console.error('❌ Error fetching helpers:', err);
      setHelpers([]);
    }

    Animated.timing(popupAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // Hide popup
  const closePopup = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setSelectedCategory(null);
    });
  };

  // Navigate to Helpers
  const handleShowAll = () => {
    closePopup();
    navigation.navigate('Helpers');
  };

  const popupTranslateY = popupAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0], // 👈 bring it all the way up
  });


  return (
    <View style={{ flex: 1 }}>
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
            <TouchableOpacity
              style={styles.categoryItem}
              key={index}
              onPress={() => openCategoryPopup(cat)}>
              <View style={styles.categoryIcon}>
                <Icon name={cat.icon || 'apps-outline'} size={26} color="#007AFF" />
              </View>
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {categories.length > 9 && (
          <TouchableOpacity style={styles.expandButton} onPress={toggleCategories}>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <Icon name="chevron-down-outline" size={28} color="#007AFF" />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
      {/* 🔹 Popup Sheet */}
      <Modal
        visible={!!selectedCategory}
        animationType="slide"
        transparent
        onRequestClose={closePopup}
      >
        {/* Overlay background */}
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: popupAnim, // 👈 fade background with popup
            }}
          />
          <Animated.View
            style={{
              width: '100%',
              transform: [{ translateY: popupTranslateY }],
            }}
          >
            <LinearGradient
              colors={['rgba(0,122,255,0.95)', 'rgba(0,122,255,0.98)']}
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                paddingBottom: 30,
              }}
            >

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Icon
                  name={selectedCategory?.icon || 'apps-outline'}
                  size={32} // 👈 increased size
                  color="#fff"
                  style={{ marginRight: 10 }} // 👈 space between icon and text
                />
                <Text
                  style={{
                    fontSize: 22, // 👈 slightly larger text
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {selectedCategory?.name}
                </Text>
              </View>


              <FlatList
                data={helpers}
                keyExtractor={(item) => item._id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      padding: 12,
                      borderRadius: 12,
                      marginVertical: 5,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>
                      {item.user?.name || 'Unknown'}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13 }}>
                      {item.skills.map(s => s.skillName).join(', ')}
                    </Text>
                  </View>
                )}
              />


              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={closePopup}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    paddingHorizontal: 30,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleShowAll}
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 30,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: '#007AFF', fontWeight: '600' }}>
                    Show All
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <View>
        {/* 🔹 Carousel */}
        <Text style={styles.sectionTitle}>Offers & Ads</Text>
        <Carousel
          loop
          width={width - 30}
          height={160}
          autoPlay
          scrollAnimationDuration={1200}
          data={ads}
          renderItem={({ item }) => (
            <View style={[styles.carouselItem, { backgroundColor: item.color }]}>
              <Text style={styles.carouselText}>{item.title}</Text>
            </View>
          )}
        />
      </View>
    </View>

  );
}
