import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../src/config/apiConfig';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

// Format exact backend URL for socket (remove /api)
const SOCKET_URL = BASE_URL.replace('/api', '');

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // Application ID
  const router = useRouter();
  const { user, token } = useSelector((state: any) => state.auth);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<any>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/messages/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setContext(data.context);
        }
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 300);
    }
  }, [id, token]);

  const setupSocket = useCallback(() => {
    // Force websocket transport for better stability in mobile environments
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      console.log('Socket Connected');
      setIsConnected(true);
      socketRef.current.emit('join-room', id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket Disconnected');
    });

    socketRef.current.on('new-message', (incoming: any) => {
      // Avoid duplicates from optimistic updates
      setMessages(prev => {
        const exists = prev.find(m => m._id === incoming._id || (m.tempId && m.tempId === incoming.tempId));
        if (exists) {
            // Update the optimistic message with the real one from server
            return prev.map(m => (m._id === incoming._id || (m.tempId && m.tempId === incoming.tempId)) ? incoming : m);
        }
        return [...prev, incoming];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socketRef.current.on('connect_error', (err: any) => {
      console.error('Socket Connection Error:', err);
    });
  }, [id]);

  useEffect(() => {
    fetchMessages();
    setupSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fetchMessages, setupSocket]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const tempText = input;
    const tempId = Date.now().toString();
    setInput('');

    // Optimistic Update
    const optimisticMsg = {
      _id: tempId,
      tempId: tempId,
      content: tempText,
      senderUser: user?._id,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    
    try {
      const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ applicationId: id, content: tempText })
      });
      
      if (!res.ok) {
         // Handle failure: remove optimistic message or show error
         setMessages(prev => prev.filter(m => m._id !== tempId));
      }
    } catch (err) {
      console.error('Send error:', err);
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minsStr = minutes < 10 ? '0'+minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = (item.senderUser?._id || item.senderUser) === user?._id;
    const isSystem = item.isSystemMessage;

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemBadge}>
            <Text style={styles.systemMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarChar}>{(item.senderUser?.name?.[0] || 'R').toUpperCase()}</Text>
            </View>
          </View>
        )}
        
        <View style={[
          styles.bubble, 
          isMe ? styles.bubbleRight : styles.bubbleLeft,
          item.isOptimistic && { opacity: 0.7 }
        ]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isMe ? styles.timestampRight : styles.timestampLeft]}>
              {formatTime(item.createdAt)}
            </Text>
            {isMe && (
              <MaterialCommunityIcons 
                name={item.isOptimistic ? "clock-outline" : "check-all"} 
                size={14} 
                color={item.isOptimistic ? "#FFF" : "#4ade80"} 
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const getChatTitle = () => {
    if (!context) return 'Chat';
    if (user?.role === 'company') return context.studentName;
    return context.companyName;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color="#0A0F24" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>{getChatTitle()}</Text>
            <View style={styles.statusRow}>
               <View style={[styles.onlineDot, { backgroundColor: isConnected ? '#10B981' : '#D1D5DB' }]} />
               <Text style={styles.headerSub}>{isConnected ? 'Always active' : 'Connecting...'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Feather name="more-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Chat List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || item.tempId}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <MaterialCommunityIcons name="chat-plus-outline" size={40} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyText}>Start a conversation with {getChatTitle()}</Text>
              </View>
            }
          />
        )}

        {/* Input Area */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputOuter}>
              <TouchableOpacity style={styles.inputAction}>
                <Feather name="plus" size={22} color="#4B5563" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity style={styles.inputAction}>
                <Feather name="camera" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.sendCircle, !input.trim() && { backgroundColor: '#E5E7EB' }]} 
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <MaterialCommunityIcons name="send" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          <SafeAreaView edges={['bottom']} />
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFEAE2' }, // WhatsApp-like beige background
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  backBtn: { marginRight: 10 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0A0F24' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  headerSub: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  moreBtn: { padding: 5 },

  chatList: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 20 },
  
  messageWrapper: { marginBottom: 16, maxWidth: width * 0.82 },
  messageWrapperLeft: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'flex-end' },
  messageWrapperRight: { alignSelf: 'flex-end' },

  avatarContainer: { marginRight: 8, marginBottom: 2 },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  avatarChar: { fontSize: 12, fontWeight: '800', color: '#3B82F6' },

  bubble: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  bubbleLeft: { backgroundColor: '#FFF', borderBottomLeftRadius: 5 },
  bubbleRight: { backgroundColor: '#005D4B', borderBottomRightRadius: 5 }, // WhatsApp-like dark green
  
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextLeft: { color: '#0A0F24' },
  messageTextRight: { color: '#FFF' },

  messageFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  timestamp: { fontSize: 10, fontWeight: '500' },
  timestampLeft: { color: '#9CA3AF' },
  timestampRight: { color: '#A5D6A7' },

  systemMessageContainer: { alignSelf: 'center', marginVertical: 20, width: '100%', alignItems: 'center' },
  systemBadge: { backgroundColor: '#D1E4FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  systemMessageText: { fontSize: 11, color: '#1E3A8A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyText: { color: '#6B7280', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, paddingBottom: 15 },
  inputOuter: { 
    flex: 1, backgroundColor: '#FFF', borderRadius: 28, flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 8, paddingVertical: 5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 
  },
  textInput: { flex: 1, fontSize: 16, color: '#0A0F24', maxHeight: 120, paddingHorizontal: 10, paddingVertical: 10 },
  inputAction: { padding: 10 },
  sendCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#005D4B', justifyContent: 'center', alignItems: 'center', marginLeft: 8, elevation: 3 }
});
