import { View, Text, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styles from '../../styles/home.styles.js';

// Declaring Constants, later will be migrated to env file
const { width } = Dimensions.get('window');

const ads = [
  { id: 1, color: '#FF6B6B', title: 'Special Offer!' },
  { id: 2, color: '#4ECDC4', title: '50% Off on Services!' },
  { id: 3, color: '#FFD93D', title: 'Limited Time Deal!' },
];

export default function OffersAds() {
  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------

  return (
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
  );
}