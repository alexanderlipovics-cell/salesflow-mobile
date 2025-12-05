import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#06b6d4',
  INTERESTED: '#10b981',
  SKEPTICAL: '#f59e0b',
  CONVERSATION: '#3b82f6',
  CLOSING: '#8b5cf6',
  GHOSTING: '#ef4444',
};

const PLATFORM_LINKS: Record<string, (name: string, msg: string) => string> = {
  WhatsApp: (name, msg) => `whatsapp://send?text=${encodeURIComponent(msg)}`,
  Instagram: (name, msg) => `instagram://direct`, // IG öffnen, User muss Text pasten
  Facebook: (name, msg) => `fb-messenger://`,
  LinkedIn: (name, msg) => `linkedin://messaging`,
  Email: (name, msg) => `mailto:?body=${encodeURIComponent(msg)}`,
};

export default function LeadDetailScreen({ route, navigation }: any) {
  const lead = route.params?.lead || { id: '1', name: 'Unbekannt', status: 'NEW', platform: 'WhatsApp' };
  
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMessage = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const response = await fetch('https://salesflow-ai.onrender.com/api/copilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lead.lastMsg || lead.last_message || 'Noch keine Nachricht',
          context: {
            lead_name: lead.name,
            status: lead.status,
            temperature: lead.temperature || 50
          }
        })
      });
      
      const data = await response.json();
      if (data.options && data.options.length > 0) {
        setGeneratedMessage(data.options[0].content);
      } else if (data.response) {
        setGeneratedMessage(data.response);
      } else {
        setGeneratedMessage('Hey! Ich wollte mich kurz melden - hast du noch Fragen zu unserem Gespräch? 😊');
      }
    } catch (e) {
      Alert.alert('Fehler', 'Nachricht konnte nicht generiert werden');
    }
    setLoading(false);
  };

  const copyAndOpen = async (platform: string) => {
    if (!generatedMessage) return;
    
    await Clipboard.setStringAsync(generatedMessage);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const linkFn = PLATFORM_LINKS[platform];
    if (linkFn) {
      const url = linkFn(lead.name, generatedMessage);
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        Alert.alert('Kopiert! ✓', `Nachricht wurde kopiert. ${platform} wird geöffnet.`, [
          { text: 'Öffnen', onPress: () => Linking.openURL(url) }
        ]);
      } else {
        Alert.alert('Kopiert! ✓', `Nachricht wurde in die Zwischenablage kopiert. Öffne ${platform} manuell.`);
      }
    }
  };

  const updateStatus = () => {
    navigation.navigate('CreateLead', { importedData: { ...lead, name: lead.name } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lead.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateLead', { importedData: lead })}>
          <Ionicons name="create-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Lead Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[lead.status] || COLORS.primary) + '20', borderColor: STATUS_COLORS[lead.status] || COLORS.primary }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[lead.status] || COLORS.primary }]}>{lead.status}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plattform</Text>
            <Text style={styles.infoValue}>{lead.platform || 'WhatsApp'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Temperatur</Text>
            <Text style={styles.infoValue}>{lead.temperature || 50}% 🔥</Text>
          </View>

          {(lead.lastMsg || lead.last_message) && (
            <View style={styles.lastMsgBox}>
              <Text style={styles.infoLabel}>Letzte Nachricht</Text>
              <Text style={styles.lastMsg}>"{lead.lastMsg || lead.last_message}"</Text>
            </View>
          )}

          {lead.next_follow_up && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Follow-up</Text>
              <Text style={styles.infoValue}>{lead.next_follow_up}</Text>
            </View>
          )}
        </View>

        {/* AI Generate Section */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>✨ AI Nachricht generieren</Text>
          
          <TouchableOpacity style={styles.generateBtn} onPress={generateMessage} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#000" />
                <Text style={styles.generateBtnText}>Nachricht generieren</Text>
              </>
            )}
          </TouchableOpacity>

          {generatedMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{generatedMessage}</Text>
              
              <Text style={styles.sendViaLabel}>Senden via:</Text>
              <View style={styles.platformRow}>
                <TouchableOpacity style={[styles.platformBtn, { backgroundColor: '#25D366' }]} onPress={() => copyAndOpen('WhatsApp')}>
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.platformBtnText}>WhatsApp</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.platformBtn, { backgroundColor: '#E4405F' }]} onPress={() => copyAndOpen('Instagram')}>
                  <Ionicons name="logo-instagram" size={20} color="#fff" />
                  <Text style={styles.platformBtnText}>Instagram</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.platformBtn, { backgroundColor: '#0A66C2' }]} onPress={() => copyAndOpen('LinkedIn')}>
                  <Ionicons name="logo-linkedin" size={20} color="#fff" />
                  <Text style={styles.platformBtnText}>LinkedIn</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.copyOnlyBtn} onPress={() => { Clipboard.setStringAsync(generatedMessage); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Kopiert!'); }}>
                <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                <Text style={styles.copyOnlyText}>Nur kopieren</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={updateStatus}>
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionText}>Status aktualisieren</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CreateLead', { importedData: lead })}>
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionText}>Follow-up planen</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { flex: 1, padding: 16 },
  infoCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  lastMsgBox: { paddingTop: 12 },
  lastMsg: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', marginTop: 6 },
  aiSection: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  generateBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
  generateBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  messageBox: { marginTop: 16, padding: 16, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  messageText: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 16 },
  sendViaLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  platformRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  platformBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, gap: 6 },
  platformBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  copyOnlyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 },
  copyOnlyText: { color: COLORS.primary, fontWeight: '600' },
  actionsSection: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  actionText: { flex: 1, fontSize: 15, color: COLORS.text },
});
