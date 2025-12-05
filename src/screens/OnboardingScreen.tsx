import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'rocket',
    title: 'Willkommen bei SalesFlow',
    subtitle: 'Dein AI-Copilot für Network Marketing',
    description: 'Verwandle jeden Kontakt in einen Abschluss mit KI-gestützten Skripten.',
  },
  {
    id: '2',
    icon: 'people',
    title: 'Leads managen',
    subtitle: 'Alle Kontakte im Blick',
    description: 'Organisiere deine Leads nach Status und Temperature. Verpasse nie wieder ein Follow-up.',
  },
  {
    id: '3',
    icon: 'sparkles',
    title: 'AI Magic Scripts',
    subtitle: 'Die perfekte Nachricht',
    description: 'Unser AI Copilot generiert personalisierte Nachrichten für jede Situation.',
  },
  {
    id: '4',
    icon: 'trending-up',
    title: 'Bereit zu starten?',
    subtitle: 'Dein Erfolg beginnt jetzt',
    description: 'Lass uns gemeinsam dein Business auf das nächste Level bringen!',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Main');
  };

  const renderSlide = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={80} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Überspringen</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === SLIDES.length - 1 ? 'Los geht\'s!' : 'Weiter'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  skipBtn: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 8 },
  skipText: { color: COLORS.textSecondary, fontSize: 16 },
  slide: { width, paddingHorizontal: 40, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  iconContainer: { width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 40, borderWidth: 2, borderColor: COLORS.border },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 40, paddingBottom: 40 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginHorizontal: 4 },
  activeDot: { backgroundColor: COLORS.primary, width: 24 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, gap: 8 },
  nextText: { color: COLORS.background, fontSize: 18, fontWeight: '700' },
});
