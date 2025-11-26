import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/authContext.js';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../styles/theme.js';

const CHAT_STORAGE_KEY = 'APP_CHATS_V1';

export default function ChatWindow() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const [chats, setChats] = useState([]); // list of {id, other, messages, lastUpdated}
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef();
  const curUserId = user?._id || user?.id || 'me';

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    // if navigated with chatUser param, open or create the chat
    const p = route.params;
    if (p && p.chatUser) {
      // prefer associating with the helper from the request (if provided)
      const req = p.request;
      if (req && (req.helperUser || req.helperUser?.user)) {
        const helper = req.helperUser.user ? req.helperUser.user : req.helperUser;
        openOrCreateChat(helper, req);
      } else {
        openOrCreateChat(p.chatUser, p.request);
      }
    }
  }, [route.params, chats]);

  const loadChats = async () => {
    try {
      const raw = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // normalize chats so `other` always points to the participant that is not the current user
      const normalized = parsed.map((c) => {
        try {
          if (!c) return c;
          const other = c.other || null;
          // if 'other' refers to current user (due to earlier saved data), flip to partner id
          if (other && (other.id === curUserId || other._id === curUserId || other === curUserId)) {
            const partnerId = (c.participants || []).find((p) => p !== curUserId) || other.id || other._id;
            return { ...c, other: { id: partnerId, name: (c.other && c.other.name && c.other.name !== (user?.name || '')) ? c.other.name : `User ${String(partnerId).slice(0,6)}` } };
          }
          return c;
        } catch (e) {
          return c;
        }
      });
      setChats(normalized);
    } catch (e) {
      console.warn('Failed to load chats', e);
    }
  };

  const saveChats = async (next) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save chats', e);
    }
  };

  const chatIdFor = (userA, userB) => {
    const ids = [userA?.id || userA?._id || userA, userB?.id || userB?._id || userB].sort();
    return ids.join('__');
  };

  // openOrCreateChat now accepts an optional request to tie the chat to a specific request/helper
  const openOrCreateChat = (other, request) => {
    if (!other) return;
    const curUser = { id: user?._id || user?.id || 'me', name: user?.name || user?.fullName || 'Me' };
    let id;
    if (request && request._id) {
      // tie chat to the request and helper so multiple requests to same helper create separate threads
      const helperId = other._id || other.id;
      id = `req__${request._id}__${helperId}`;
    } else {
      id = chatIdFor(curUser, other);
    }

    let found = chats.find((c) => c.id === id);
    if (!found) {
      const newChat = { id, participants: [curUser.id, other.id || other._id || other], other, requestId: request?._id, messages: [], lastUpdated: Date.now() };
      const next = [newChat, ...chats];
      setChats(next);
      saveChats(next);
      setActiveChatId(id);
    } else {
      setActiveChatId(id);
    }
    // switch to chat view
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChatId) return;
    const curUserId = user?._id || user?.id || 'me';
    const next = chats.map((c) => {
      if (c.id !== activeChatId) return c;
      const m = { from: curUserId, text: messageText.trim(), time: Date.now() };
      const messages = [...(c.messages || []), m];
      return { ...c, messages, lastUpdated: Date.now() };
    });
    setChats(next);
    await saveChats(next);
    setMessageText('');
    // scroll to bottom after a tick
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
  };

  const goBackToList = () => setActiveChatId(null);

  const renderChatList = () => (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      {chats.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No chats yet. Start one from a request or helper profile.</Text>
        </View>
      )}
      <FlatList
        data={chats.sort((a, b) => b.lastUpdated - a.lastUpdated)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => selectChat(item.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../../assets/icon.png')} style={styles.chatAvatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.chatName}>{item.other?.name || 'User'}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>{(item.messages && item.messages.length > 0) ? item.messages[item.messages.length - 1].text : 'No messages yet'}</Text>
              </View>
            </View>
            <Text style={styles.chatTime}>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString() : ''}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderConversation = () => {
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat) return renderChatList();
    const displayName = (chat.other && ((chat.other.id && chat.other.id !== curUserId) || (chat.other._id && chat.other._id !== curUserId)))
      ? chat.other.name
      : (chat.other && chat.other.name) || 'Conversation';

    return (
      <View style={styles.container}>
        <View style={styles.convHeader}>
          <TouchableOpacity onPress={goBackToList} style={{ paddingRight: 12 }}>
            <Text style={{ color: theme.colors.primary }}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.header}>{displayName}</Text>
        </View>

        <ScrollView ref={scrollRef} style={styles.messagesBox} contentContainerStyle={{ paddingBottom: 20 }}>
          {(chat.messages || []).map((m, idx) => {
            const mine = m.from === (user?._id || user?.id || 'me');
            return (
              <View key={idx} style={[styles.messageRow, mine ? styles.messageMine : styles.messageOther]}>
                <Text style={{ color: mine ? '#fff' : '#000' }}>{m.text}</Text>
                <Text style={styles.messageTime}>{new Date(m.time).toLocaleTimeString()}</Text>
              </View>
            );
          })}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputRow}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {activeChatId ? renderConversation() : renderChatList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#777' },
  chatItem: { backgroundColor: theme.colors.card, padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatAvatar: { width: 48, height: 48, borderRadius: 24 },
  chatName: { fontWeight: '700' },
  chatPreview: { color: '#666', maxWidth: 220 },
  chatTime: { color: '#999', fontSize: 11 },
  convHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  messagesBox: { flex: 1, marginBottom: 8 },
  messageRow: { maxWidth: '80%', padding: 10, borderRadius: 10, marginVertical: 6 },
  messageMine: { backgroundColor: theme.colors.primary, alignSelf: 'flex-end' },
  messageOther: { backgroundColor: '#EDEEF0', alignSelf: 'flex-start' },
  messageTime: { fontSize: 10, color: '#333', marginTop: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  sendBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
});