import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Neu', color: COLORS.primary },
  { value: 'INTERESTED', label: 'Interessiert', color: '#10b981' },
  { value: 'SKEPTICAL', label: 'Skeptisch', color: '#f59e0b' },
  { value: 'CONVERSATION', label: 'Im Gespräch', color: '#3b82f6' },
  { value: 'CLOSING', label: 'Kurz vor Abschluss', color: '#8b5cf6' },
  { value: 'GHOSTING', label: 'Ghosting', color: '#ef4444' },
];

const FOLLOWUP_OPTIONS = [
  { days: 1, label: 'Morgen' },
  { days: 3, label: 'In 3 Tagen' },
  { days: 7, label: 'In 1 Woche' },
  { days: 14, label: 'In 2 Wochen' },
];

export default function CreateLeadScreen({ navigation, route }: any) {
  // Falls von Screenshot Import: Daten übernehmen
  const importedData = route.params?.importedData || {};
  
  const [name, setName] = useState(importedData.name || '');
  const [platform, setPlatform] = useState(importedData.platform || 'WhatsApp');
  const [status, setStatus] = useState(importedData.status || '');
  const [lastMessage, setLastMessage] = useState(importedData.lastMessage || '');
  const [followUpDays, setFollowUpDays] = useState<number | null>(null);
  const [followUpReason, setFollowUpReason] = useState('');
  const [loading, setLoading] = useState(false);

  const createLead = async () => {
    // Validierung
    if (!name.trim()) return Alert.alert('Fehler', 'Name ist Pflichtfeld');
    if (!status) return Alert.alert('Fehler', 'Status ist Pflichtfeld');
    if (!followUpDays) return Alert.alert('Fehler', 'Follow-up Datum ist Pflichtfeld');

    setLoading(true);
    
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + followUpDays);

    try {
      const response = await fetch('https://salesflow-ai.onrender.com/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          platform,
          status,
          last_message: lastMessage,
          next_follow_up: followUpDate.toISOString().split('T')[0],
          follow_up_reason: followUpReason || `Follow-up nach ${FOLLOWUP_OPTIONS.find(f => f.days === followUpDays)?.label}`,
          temperature: importedData.temperature || 50,
          tags: importedData.tags || [],
        })
      });

      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      Alert.alert('Erfolg', 'Lead wurde angelegt!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    } catch (e) {
      Alert.alert('Fehler', 'Lead konnte nicht gespeichert werden');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Neuer Lead</Text>
        <TouchableOpacity onPress={createLead} disabled={loading}>
          <Text style={[styles.saveBtn, loading && { opacity: 0.5 }]}>Speichern</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* Name */}
        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Max Mustermann" placeholderTextColor={COLORS.textMuted} />

        {/* Plattform */}
        <Text style={styles.label}>Plattform</Text>
        <View style={styles.chipRow}>
          {['WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok'].map(p => (
            <TouchableOpacity key={p} style={[styles.chip, platform === p && styles.chipActive]} onPress={() => setPlatform(p)}>
              <Text style={[styles.chipText, platform === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status - PFLICHT */}
        <Text style={styles.label}>Status * <Text style={styles.required}>(Pflicht)</Text></Text>
        <View style={styles.statusGrid}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity key={s.value} style={[styles.statusBtn, status === s.value && { borderColor: s.color, backgroundColor: s.color + '20' }]} onPress={() => setStatus(s.value)}>
              <Text style={[styles.statusText, status === s.value && { color: s.color }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Letzte Nachricht */}
        <Text style={styles.label}>Letzte Nachricht</Text>
        <TextInput style={[styles.input, styles.textArea]} value={lastMessage} onChangeText={setLastMessage} placeholder="Was hat der Lead zuletzt geschrieben?" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} />

        {/* Follow-up - PFLICHT */}
        <Text style={styles.label}>Nächstes Follow-up * <Text style={styles.required}>(Pflicht)</Text></Text>
        <View style={styles.chipRow}>
          {FOLLOWUP_OPTIONS.map(f => (
            <TouchableOpacity key={f.days} style={[styles.chip, followUpDays === f.days && styles.chipActive]} onPress={() => setFollowUpDays(f.days)}>
              <Text style={[styles.chipText, followUpDays === f.days && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Follow-up Grund */}
        <Text style={styles.label}>Grund für Follow-up</Text>
        <TextInput style={styles.input} value={followUpReason} onChangeText={setFollowUpReason} placeholder="z.B. Will mehr über Preise wissen" placeholderTextColor={COLORS.textMuted} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  saveBtn: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  required: { color: COLORS.error, fontWeight: '400', fontSize: 12 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 14 },
  chipTextActive: { color: COLORS.primary, fontWeight: '600' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minWidth: '30%' },
  statusText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
});

