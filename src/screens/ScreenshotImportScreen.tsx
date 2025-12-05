import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function ScreenshotImportScreen({ navigation }: any) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      analyzeScreenshot(result.assets[0].base64!);
    }
  };

  const analyzeScreenshot = async (base64: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://salesflow-ai.onrender.com/api/copilot/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64 })
      });
      const data = await response.json();
      setExtractedData(data);
    } catch (e) {
      Alert.alert('Fehler', 'Screenshot konnte nicht analysiert werden');
    }
    setLoading(false);
  };

  const createLead = () => {
    if (extractedData) {
      navigation.navigate('LeadDetailScreen', { 
        lead: {
          id: Date.now().toString(),
          name: extractedData.name,
          status: (extractedData.status || 'NEW').toUpperCase(),
          lastMsg: extractedData.lastMessage,
          temperature: extractedData.temperature,
          tags: extractedData.tags,
          unread: true,
          time: 'Jetzt'
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Screenshot Import</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Lade einen Chat-Screenshot hoch und FELLO erkennt den Lead automatisch</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.uploadText}>Screenshot auswählen</Text>
            <Text style={styles.uploadHint}>Instagram, WhatsApp, Facebook...</Text>
          </View>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>FELLO analysiert...</Text>
        </View>
      )}

      {extractedData && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>✨ Lead erkannt</Text>
          <View style={styles.resultRow}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{extractedData.name}</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Plattform:</Text><Text style={styles.value}>{extractedData.platform}</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Status:</Text><Text style={styles.value}>{extractedData.status}</Text></View>
          <View style={styles.resultRow}><Text style={styles.label}>Temperatur:</Text><Text style={styles.value}>{extractedData.temperature}%</Text></View>
          <Text style={styles.lastMsg}>"{extractedData.lastMessage}"</Text>
          
          <TouchableOpacity style={styles.createBtn} onPress={createLead}>
            <Ionicons name="person-add" size={20} color="#000" />
            <Text style={styles.createBtnText}>Lead anlegen</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center' },
  uploadBox: { width: '100%', height: 280, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  placeholder: { alignItems: 'center' },
  uploadText: { color: COLORS.text, marginTop: 12, fontSize: 16, fontWeight: '600' },
  uploadHint: { color: COLORS.textSecondary, marginTop: 4, fontSize: 12 },
  preview: { width: '100%', height: '100%' },
  loadingBox: { alignItems: 'center', padding: 20 },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  resultCard: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  resultTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: COLORS.textSecondary },
  value: { color: COLORS.text, fontWeight: '600' },
  lastMsg: { color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 12, marginBottom: 16 },
  createBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  createBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});

