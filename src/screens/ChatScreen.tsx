import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

// Preset-Typen für verschiedene Tool-Modi
export type ChatPreset = 'cold_call' | 'closing' | 'followup' | 'autopilot' | null;

// Preset-Konfigurationen
const PRESET_CONFIG: Record<string, { title: string; subtitle: string; color: string; icon: keyof typeof Ionicons.glyphMap; initialMessage: string }> = {
  cold_call: {
    title: 'Cold Call Script',
    subtitle: 'Kaltakquise-Assistent',
    color: COLORS.primary,
    icon: 'call',
    initialMessage: 'Hey! 📞 Du bist im Cold Call Modus. Ich helfe dir, ein perfektes Gesprächsskript zu erstellen.\n\nSag mir:\n• Was verkaufst du?\n• Wer ist deine Zielgruppe?\n• Was ist dein Hauptnutzen?',
  },
  closing: {
    title: 'Closing Helper',
    subtitle: 'Abschluss-Assistent',
    color: '#10b981',
    icon: 'checkmark-done',
    initialMessage: 'Hey! 🎯 Du bist im Closing Modus. Ich helfe dir beim erfolgreichen Abschluss.\n\nErzähl mir:\n• Um welchen Lead geht es?\n• Wo steht ihr im Gespräch?\n• Welche Einwände gibt es noch?',
  },
  followup: {
    title: 'Follow-Up Generator',
    subtitle: 'Nachfass-Assistent',
    color: '#f59e0b',
    icon: 'refresh',
    initialMessage: 'Hey! 🔄 Du bist im Follow-Up Modus. Ich generiere die perfekte Nachfass-Nachricht für dich.\n\nSag mir:\n• Wer ist der Kontakt?\n• Was war der letzte Stand?\n• Wie lange ist das her?',
  },
  autopilot: {
    title: 'Autopilot',
    subtitle: 'Automatisierungs-Assistent',
    color: '#f97316',
    icon: 'rocket',
    initialMessage: 'Hey! 🚀 Du bist im Autopilot Modus. Ich helfe dir, Vertriebsprozesse zu automatisieren.\n\nWas möchtest du automatisieren?\n• Follow-up Sequenzen\n• Lead-Qualifizierung\n• Nachrichtenvorlagen',
  },
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatScreenProps {
  route?: { params?: { preset?: ChatPreset } };
  navigation?: any;
}

export default function ChatScreen({ route }: ChatScreenProps) {
  // Preset aus Route-Parametern holen
  const preset = route?.params?.preset || null;
  const presetConfig = preset ? PRESET_CONFIG[preset] : null;

  // Initiale Nachricht basierend auf Preset
  const getInitialMessage = (): Message => {
    if (presetConfig) {
      return { id: '1', text: presetConfig.initialMessage, sender: 'ai', timestamp: new Date() };
    }
    return { id: '1', text: 'Hey! 👋 Ich bin FELLO, dein AI Sales Copilot. Frag mich alles über Verkauf, Einwandbehandlung oder lass mich einen Lead analysieren.', sender: 'ai', timestamp: new Date() };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatPreset>(preset);
  const flatListRef = useRef<FlatList>(null);

  // Reset bei Preset-Änderung
  useEffect(() => {
    if (preset !== currentMode) {
      setCurrentMode(preset);
      setMessages([getInitialMessage()]);
    }
  }, [preset]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://salesflow-ai.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          conversation_history: [],
          // Mode für Backend-seitige Preset-Logik (z.B. spezielle System-Prompts)
          mode: currentMode || undefined,
        })
      });
      
      const data = await response.json();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: data.response || data.message || 'Hmm, da ist was schiefgelaufen.', sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Verbindung fehlgeschlagen. Prüfe deine Internetverbindung.', sender: 'ai', timestamp: new Date() }]);
    }
    
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiAvatar, presetConfig && { borderColor: presetConfig.color }]}>
            <Ionicons name={presetConfig?.icon || 'sparkles'} size={24} color={presetConfig?.color || COLORS.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{presetConfig?.title || 'FELLO'}</Text>
            <Text style={styles.headerSub}>{presetConfig?.subtitle || 'AI Sales Copilot'}</Text>
          </View>
        </View>
        {/* Modus-Badge anzeigen wenn Preset aktiv */}
        {presetConfig && (
          <View style={[styles.modeBadge, { backgroundColor: presetConfig.color + '20', borderColor: presetConfig.color }]}>
            <Text style={[styles.modeBadgeText, { color: presetConfig.color }]}>
              {presetConfig.title}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.sender === 'user' ? styles.userRow : styles.aiRow]}>
            {item.sender === 'ai' && <View style={styles.aiIcon}><Ionicons name="sparkles" size={16} color={COLORS.primary} /></View>}
            <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.msgText}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>FELLO denkt nach...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Frag FELLO etwas..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading}>
            <Ionicons name="send" size={20} color={input.trim() ? COLORS.primary : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textSecondary },
  modeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginLeft: 8 },
  modeBadgeText: { fontSize: 10, fontWeight: '700' },
  messageList: { padding: 16, paddingBottom: 100 },
  msgRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end' },
  aiRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  bubble: { padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: COLORS.surface, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22, color: COLORS.text },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  loadingText: { color: COLORS.textSecondary, fontSize: 13 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { padding: 10, marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.5 },
});

